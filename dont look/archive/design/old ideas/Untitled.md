```
# ============================================================
# CSV PARSER IN PSEUDO LANGUAGE
# ============================================================
# Legend:
#   $something   = compile-time only, erased before runtime
#   NONE         = missing value
#   SOME(x)      = present value
#   EMPTY STRING = present, but length 0
#
# The schema is fixed-size at compile time.
# Each row type is generated from the schema.
# Header order may differ from schema order.
# ============================================================


# ============================================================
# 1) SCHEMA LANGUAGE
# ============================================================

KIND =
    TEXT
    U64
    I64
    BOOL
    OPTIONAL(KIND)

CHECK =
    NONEMPTY
    MIN_U64(n)
    MAX_U64(n)
    RANGE_U64(lo, hi)
    MIN_I64(n)
    MAX_I64(n)
    RANGE_I64(lo, hi)
    CONTAINS(fragment)
    ONE_OF(list_of_text)

RECORD FieldSpec
    name   : TEXT
    kind   : KIND
    checks : LIST OF CHECK
END

RECORD Schema
    fields : LIST OF FieldSpec
END


# ============================================================
# 2) COMPILE-TIME SPECIALIZATION
# ============================================================
# The compiler runs these steps once per schema.
# They produce constants and unrolled parser code.
# No runtime storage is created for these $values.
# ============================================================

$PROCEDURE CHECK_SCHEMA(S : Schema)
    n := LENGTH(S.fields)
    seen_names := EMPTY LIST

    FOR i FROM 0 TO n - 1
        f := S.fields[i]

        IF LENGTH(f.name) = 0 THEN
            FAIL "schema field name is empty"
        END IF

        IF NAME_EXISTS_IN_LIST(seen_names, f.name) THEN
            FAIL "duplicate schema field name: " + f.name
        END IF
        APPEND seen_names, f.name

        # Validate that each check matches the field kind.
        FOR each c IN f.checks
            IF NOT CHECK_MATCHES_KIND(c, f.kind) THEN
                FAIL "invalid check for field: " + f.name
            END IF
        END FOR
    END FOR

    OK
END


$PROCEDURE EXPAND_SCHEMA(S : Schema) RETURNS Descriptor
    CALL CHECK_SCHEMA(S)

    desc.field_count := LENGTH(S.fields)

    FOR i FROM 0 TO desc.field_count - 1
        desc.field_name[i]   := S.fields[i].name
        desc.field_kind[i]   := S.fields[i].kind
        desc.field_checks[i] := S.fields[i].checks

        # Generate the row type:
        #   TEXT -> TEXT
        #   U64  -> U64
        #   I64  -> I64
        #   BOOL -> BOOL
        #   OPTIONAL(K) -> Maybe<DecodeKind(K)>
        desc.row_field_type[i] := DECODE_KIND_AT_COMPILE_TIME(S.fields[i].kind)
    END FOR

    # Generated row shape:
    #   Row = record with one field per schema field, in schema order.
    desc.row_shape := "record(" + JOIN_NAMES_AND_TYPES(desc.field_name, desc.row_field_type) + ")"

    RETURN desc
END


$FUNCTION DECODE_KIND_AT_COMPILE_TIME(K : KIND) RETURNS TYPE
    IF K = TEXT THEN RETURN TEXT END IF
    IF K = U64  THEN RETURN U64  END IF
    IF K = I64  THEN RETURN I64  END IF
    IF K = BOOL THEN RETURN BOOL END IF

    IF K IS OPTIONAL(inner) THEN
        RETURN Maybe<DECODE_KIND_AT_COMPILE_TIME(inner)>
    END IF

    FAIL "unknown kind"
END


FUNCTION CHECK_MATCHES_KIND(c : CHECK, k : KIND) RETURNS BOOLEAN
    # Primitive compatibility checks only.
    IF c = NONEMPTY THEN
        RETURN k = TEXT OR k IS OPTIONAL(TEXT)
    END IF

    IF c STARTS WITH MIN_U64 OR c STARTS WITH MAX_U64 OR c STARTS WITH RANGE_U64 THEN
        RETURN k = U64 OR k IS OPTIONAL(U64)
    END IF

    IF c STARTS WITH MIN_I64 OR c STARTS WITH MAX_I64 OR c STARTS WITH RANGE_I64 THEN
        RETURN k = I64 OR k IS OPTIONAL(I64)
    END IF

    IF c STARTS WITH CONTAINS THEN
        RETURN k = TEXT OR k IS OPTIONAL(TEXT)
    END IF

    IF c STARTS WITH ONE_OF THEN
        RETURN k = TEXT OR k IS OPTIONAL(TEXT) OR k = BOOL OR k IS OPTIONAL(BOOL)
    END IF

    RETURN FALSE
END


# ============================================================
# 3) RUNTIME DATA
# ============================================================

RECORD Token
    present : BOOLEAN
    text    : TEXT
END

RECORD Maybe<T>
    tag   : TEXT        # "NONE" or "SOME"
    value : T           # valid only when tag = "SOME"
END

RECORD Parser
    source_text        : TEXT
    physical_lines     : LIST OF TEXT
    logical_records    : LIST OF TEXT
    header_tokens      : LIST OF Token
    header_to_source   : LIST OF INTEGER
    rows               : LIST OF ANY_ROW
    error              : TEXT
END

# ANY_ROW means:
#   a row value matching the specialized row shape for the schema.
#   It is not generic at runtime; the compiler substitutes the actual row record.


# ============================================================
# 4) BASIC TEXT HELPERS
# ============================================================

FUNCTION IS_SPACE(ch : CHAR) RETURNS BOOLEAN
    RETURN ch = ' ' OR ch = '\t'
END

FUNCTION IS_DIGIT(ch : CHAR) RETURNS BOOLEAN
    RETURN ch >= '0' AND ch <= '9'
END

FUNCTION TO_LOWER(ch : CHAR) RETURNS CHAR
    IF ch >= 'A' AND ch <= 'Z' THEN
        RETURN CHAR(ORD(ch) + 32)
    END IF
    RETURN ch
END

FUNCTION TRIM(text : TEXT) RETURNS TEXT
    left := 0
    right := LENGTH(text)

    WHILE left < right AND IS_SPACE(text[left]) DO
        left := left + 1
    END WHILE

    WHILE right > left AND IS_SPACE(text[right - 1]) DO
        right := right - 1
    END WHILE

    RETURN SUBTEXT(text, left, right - left)
END

FUNCTION FIND_SUBSTRING(text : TEXT, needle : TEXT) RETURNS INTEGER
    IF LENGTH(needle) = 0 THEN
        RETURN 0
    END IF

    IF LENGTH(needle) > LENGTH(text) THEN
        RETURN -1
    END IF

    FOR i FROM 0 TO LENGTH(text) - LENGTH(needle)
        matched := TRUE
        FOR j FROM 0 TO LENGTH(needle) - 1
            IF text[i + j] != needle[j] THEN
                matched := FALSE
                BREAK
            END IF
        END FOR
        IF matched THEN
            RETURN i
        END IF
    END FOR

    RETURN -1
END


# ============================================================
# 5) NUMERIC PARSERS
# ============================================================

FUNCTION PARSE_U64(text : TEXT) RETURNS RESULT<U64, TEXT>
    s := TRIM(text)
    IF LENGTH(s) = 0 THEN
        RETURN FAIL "empty unsigned integer"
    END IF

    value := 0
    FOR each ch IN s
        IF NOT IS_DIGIT(ch) THEN
            RETURN FAIL "invalid unsigned integer: " + s
        END IF

        digit := ORD(ch) - ORD('0')

        IF value > (MAX_U64 - digit) / 10 THEN
            RETURN FAIL "unsigned integer overflow: " + s
        END IF

        value := value * 10 + digit
    END FOR

    RETURN OK value
END

FUNCTION PARSE_I64(text : TEXT) RETURNS RESULT<I64, TEXT>
    s := TRIM(text)
    IF LENGTH(s) = 0 THEN
        RETURN FAIL "empty signed integer"
    END IF

    neg := FALSE
    pos := 0

    IF s[0] = '-' THEN
        neg := TRUE
        pos := 1
    ELSE IF s[0] = '+' THEN
        pos := 1
    END IF

    IF pos = LENGTH(s) THEN
        RETURN FAIL "invalid signed integer: " + s
    END IF

    value := 0
    FOR i FROM pos TO LENGTH(s) - 1
        ch := s[i]
        IF NOT IS_DIGIT(ch) THEN
            RETURN FAIL "invalid signed integer: " + s
        END IF

        digit := ORD(ch) - ORD('0')

        IF value > (MAX_I64_ABS - digit) / 10 THEN
            RETURN FAIL "signed integer overflow: " + s
        END IF

        value := value * 10 + digit
    END FOR

    IF neg THEN
        value := -value
    END IF

    RETURN OK value
END

FUNCTION PARSE_BOOL(text : TEXT) RETURNS RESULT<BOOL, TEXT>
    s := TRIM(text)
    low := LOWERCASE(s)

    IF low = "true" OR low = "1" OR low = "yes" THEN
        RETURN OK TRUE
    END IF

    IF low = "false" OR low = "0" OR low = "no" THEN
        RETURN OK FALSE
    END IF

    RETURN FAIL "invalid boolean: " + s
END


# ============================================================
# 6) CSV RECORD SCANNING
# ============================================================

FUNCTION SPLIT_PHYSICAL_LINES(text : TEXT) RETURNS LIST OF TEXT
    lines := EMPTY LIST
    current := ""
    i := 0

    WHILE i < LENGTH(text)
        ch := text[i]

        IF ch = '\r' THEN
            IF i + 1 < LENGTH(text) AND text[i + 1] = '\n' THEN
                i := i + 1
            END IF
            APPEND lines, current
            current := ""
        ELSE IF ch = '\n' THEN
            APPEND lines, current
            current := ""
        ELSE
            current := current + ch
        END IF

        i := i + 1
    END WHILE

    APPEND lines, current
    RETURN lines
END


FUNCTION QUOTE_STATE_AFTER_LINE(in_quotes : BOOLEAN, line : TEXT) RETURNS BOOLEAN
    i := 0
    WHILE i < LENGTH(line)
        ch := line[i]

        IF ch = '"' THEN
            IF in_quotes = TRUE AND i + 1 < LENGTH(line) AND line[i + 1] = '"' THEN
                i := i + 1
            ELSE
                in_quotes := NOT in_quotes
            END IF
        END IF

        i := i + 1
    END WHILE

    RETURN in_quotes
END


PROCEDURE BUILD_LOGICAL_RECORDS(P : Parser)
    P.logical_records := EMPTY LIST

    current := ""
    in_quotes := FALSE

    FOR each line IN P.physical_lines
        IF LENGTH(current) > 0 THEN
            current := current + '\n'
        END IF

        current := current + line
        in_quotes := QUOTE_STATE_AFTER_LINE(in_quotes, line)

        IF in_quotes = FALSE THEN
            APPEND P.logical_records, current
            current := ""
        END IF
    END FOR

    IF in_quotes = TRUE THEN
        P.error := "unmatched quote at end of file"
        FAIL P.error
    END IF

    IF LENGTH(current) > 0 THEN
        APPEND P.logical_records, current
    END IF
END


# ============================================================
# 7) CSV FIELD SPLITTER
# ============================================================

PROCEDURE APPEND_EMPTY_TOKEN(tokens : LIST OF Token)
    t := Token
    t.present := FALSE
    t.text := ""
    APPEND tokens, t
END


FUNCTION SPLIT_CSV_RECORD(record_text : TEXT) RETURNS RESULT<LIST OF Token, TEXT>
    tokens := EMPTY LIST
    current := ""
    state := "FIELD_START"

    i := 0
    WHILE i < LENGTH(record_text)
        ch := record_text[i]

        IF state = "FIELD_START" THEN
            IF ch = ',' THEN
                APPEND_EMPTY_TOKEN(tokens)
            ELSE IF ch = '"' THEN
                state := "IN_QUOTED"
            ELSE
                current := current + ch
                state := "IN_UNQUOTED"
            END IF

        ELSE IF state = "IN_UNQUOTED" THEN
            IF ch = ',' THEN
                t := Token
                t.present := TRUE
                t.text := current
                APPEND tokens, t
                current := ""
                state := "FIELD_START"
            ELSE
                current := current + ch
            END IF

        ELSE IF state = "IN_QUOTED" THEN
            IF ch = '"' THEN
                state := "AFTER_QUOTE"
            ELSE
                current := current + ch
            END IF

        ELSE IF state = "AFTER_QUOTE" THEN
            IF ch = '"' THEN
                current := current + '"'
                state := "IN_QUOTED"
            ELSE IF ch = ',' THEN
                t := Token
                t.present := TRUE
                t.text := current
                APPEND tokens, t
                current := ""
                state := "FIELD_START"
            ELSE
                RETURN FAIL "invalid character after closing quote"
            END IF
        END IF

        i := i + 1
    END WHILE

    IF state = "FIELD_START" THEN
        APPEND_EMPTY_TOKEN(tokens)
        RETURN OK tokens
    END IF

    IF state = "IN_UNQUOTED" THEN
        t := Token
        t.present := TRUE
        t.text := current
        APPEND tokens, t
        RETURN OK tokens
    END IF

    IF state = "AFTER_QUOTE" THEN
        t := Token
        t.present := TRUE
        t.text := current
        APPEND tokens, t
        RETURN OK tokens
    END IF

    IF state = "IN_QUOTED" THEN
        RETURN FAIL "unmatched quote in record"
    END IF

    RETURN FAIL "unknown CSV state"
END


# ============================================================
# 8) FORMATTERS
# ============================================================

FUNCTION NEEDS_QUOTING(text : TEXT) RETURNS BOOLEAN
    IF LENGTH(text) = 0 THEN
        RETURN TRUE
    END IF

    IF text[0] = ' ' OR text[LENGTH(text) - 1] = ' ' THEN
        RETURN TRUE
    END IF

    FOR each ch IN text
        IF ch = ',' OR ch = '"' OR ch = '\n' OR ch = '\r' THEN
            RETURN TRUE
        END IF
    END FOR

    RETURN FALSE
END


FUNCTION ESCAPE_CSV_TEXT(text : TEXT) RETURNS TEXT
    out := "\""

    FOR each ch IN text
        IF ch = '"' THEN
            out := out + "\"\""
        ELSE
            out := out + ch
        END IF
    END FOR

    out := out + "\""
    RETURN out
END


FUNCTION FORMAT_BOOL(v : BOOL) RETURNS TEXT
    IF v THEN
        RETURN "true"
    ELSE
        RETURN "false"
    END IF
END

FUNCTION FORMAT_U64(v : U64) RETURNS TEXT
    RETURN U64_TO_TEXT(v)
END

FUNCTION FORMAT_I64(v : I64) RETURNS TEXT
    RETURN I64_TO_TEXT(v)
END

FUNCTION FORMAT_TEXT(v : TEXT) RETURNS TEXT
    IF NEEDS_QUOTING(v) THEN
        RETURN ESCAPE_CSV_TEXT(v)
    END IF
    RETURN v
END


# ============================================================
# 9) CELL DECODING
# ============================================================

FUNCTION DECODE_CELL(kind : KIND, tok : Token) RETURNS RESULT<ANY_VALUE, TEXT>
    IF kind IS OPTIONAL(inner) THEN
        IF tok.present = FALSE THEN
            RETURN OK NONE
        END IF

        inner_value := DECODE_CELL(inner, tok)
        IF inner_value IS FAIL THEN
            RETURN inner_value
        END IF

        RETURN OK SOME(inner_value.value)
    END IF

    IF tok.present = FALSE THEN
        RETURN FAIL "missing required field"
    END IF

    IF kind = TEXT THEN
        RETURN OK tok.text
    END IF

    IF kind = U64 THEN
        RETURN PARSE_U64(tok.text)
    END IF

    IF kind = I64 THEN
        RETURN PARSE_I64(tok.text)
    END IF

    IF kind = BOOL THEN
        RETURN PARSE_BOOL(tok.text)
    END IF

    RETURN FAIL "unknown kind"
END


FUNCTION FORMAT_CELL(kind : KIND, value : ANY_VALUE) RETURNS TEXT
    IF kind IS OPTIONAL(inner) THEN
        IF value = NONE THEN
            RETURN ""
        END IF
        RETURN FORMAT_CELL(inner, value.value)
    END IF

    IF kind = TEXT THEN
        RETURN FORMAT_TEXT(value)
    END IF

    IF kind = U64 THEN
        RETURN FORMAT_U64(value)
    END IF

    IF kind = I64 THEN
        RETURN FORMAT_I64(value)
    END IF

    IF kind = BOOL THEN
        RETURN FORMAT_BOOL(value)
    END IF

    FAIL "unknown kind"
END


# ============================================================
# 10) VALUE VALIDATION
# ============================================================

FUNCTION CHECK_VALUE(kind : KIND, value : ANY_VALUE, checks : LIST OF CHECK) RETURNS RESULT<VOID, TEXT>
    IF kind IS OPTIONAL(inner) THEN
        IF value = NONE THEN
            RETURN OK
        END IF
        RETURN CHECK_VALUE(inner, value.value, checks)
    END IF

    FOR each c IN checks
        IF c = NONEMPTY THEN
            IF kind != TEXT THEN
                RETURN FAIL "NONEMPTY used on non-text value"
            END IF
            IF LENGTH(value) = 0 THEN
                RETURN FAIL "empty text is not allowed"
            END IF
        END IF

        IF c STARTS WITH MIN_U64 THEN
            limit := c.n
            IF value < limit THEN
                RETURN FAIL "value below minimum"
            END IF
        END IF

        IF c STARTS WITH MAX_U64 THEN
            limit := c.n
            IF value > limit THEN
                RETURN FAIL "value above maximum"
            END IF
        END IF

        IF c STARTS WITH RANGE_U64 THEN
            lo := c.lo
            hi := c.hi
            IF value < lo OR value > hi THEN
                RETURN FAIL "value outside allowed range"
            END IF
        END IF

        IF c STARTS WITH MIN_I64 THEN
            limit := c.n
            IF value < limit THEN
                RETURN FAIL "value below minimum"
            END IF
        END IF

        IF c STARTS WITH MAX_I64 THEN
            limit := c.n
            IF value > limit THEN
                RETURN FAIL "value above maximum"
            END IF
        END IF

        IF c STARTS WITH RANGE_I64 THEN
            lo := c.lo
            hi := c.hi
            IF value < lo OR value > hi THEN
                RETURN FAIL "value outside allowed range"
            END IF
        END IF

        IF c STARTS WITH CONTAINS THEN
            fragment := c.fragment
            IF FIND_SUBSTRING(value, fragment) < 0 THEN
                RETURN FAIL "missing required fragment: " + fragment
            END IF
        END IF

        IF c STARTS WITH ONE_OF THEN
            ok := FALSE
            FOR each item IN c.list_of_text
                IF TEXT_EQ(value, item) THEN
                    ok := TRUE
                    BREAK
                END IF
            END FOR
            IF ok = FALSE THEN
                RETURN FAIL "value not in allowed set"
            END IF
        END IF
    END FOR

    RETURN OK
END


# ============================================================
# 11) PARSER LIFECYCLE
# ============================================================

PROCEDURE NEW_PARSER(P : OUT Parser)
    P.source_text := ""
    P.physical_lines := EMPTY LIST
    P.logical_records := EMPTY LIST
    P.header_tokens := EMPTY LIST
    P.header_to_source := EMPTY LIST
    P.rows := EMPTY LIST
    P.error := ""
END


PROCEDURE READ(P : INOUT Parser, text : TEXT)
    P.source_text := text
    P.physical_lines := SPLIT_PHYSICAL_LINES(text)

    P.logical_records := EMPTY LIST
    P.header_tokens := EMPTY LIST
    P.header_to_source := EMPTY LIST
    P.rows := EMPTY LIST
    P.error := ""
END
# STATE AFTER READ:
#   source_text     = full raw input
#   physical_lines  = full
#   logical_records = empty
#   header_tokens   = empty
#   header_to_source= empty
#   rows            = empty
#   error           = empty


PROCEDURE INDEX_HEADER(P : INOUT Parser, D : Descriptor)
    IF LENGTH(P.physical_lines) = 0 THEN
        P.error := "empty input"
        FAIL P.error
    END IF

    CALL BUILD_LOGICAL_RECORDS(P)
    IF P.error != "" THEN
        FAIL P.error
    END IF

    IF LENGTH(P.logical_records) = 0 THEN
        P.error := "no records"
        FAIL P.error
    END IF

    header_result := SPLIT_CSV_RECORD(P.logical_records[0])
    IF header_result IS FAIL THEN
        P.error := header_result.error
        FAIL P.error
    END IF

    P.header_tokens := header_result.value

    IF LENGTH(P.header_tokens) != D.field_count THEN
        P.error := "header column count does not match schema field count"
        FAIL P.error
    END IF

    P.header_to_source := ARRAY_FILLED_WITH(-1, D.field_count)
    used_source := ARRAY_FILLED_WITH(FALSE, D.field_count)

    # Match schema fields to header columns, regardless of order.
    FOR i FROM 0 TO D.field_count - 1
        wanted := D.field_name[i]
        found := -1

        FOR j FROM 0 TO LENGTH(P.header_tokens) - 1
            tok := P.header_tokens[j]

            IF tok.present = FALSE THEN
                P.error := "blank header column"
                FAIL P.error
            END IF

            IF TEXT_EQ(tok.text, wanted) THEN
                found := j
                BREAK
            END IF
        END FOR

        IF found = -1 THEN
            P.error := "missing header column: " + wanted
            FAIL P.error
        END IF

        IF used_source[found] = TRUE THEN
            P.error := "duplicate header column: " + wanted
            FAIL P.error
        END IF

        used_source[found] := TRUE
        P.header_to_source[i] := found
    END FOR

    FOR j FROM 0 TO D.field_count - 1
        IF used_source[j] = FALSE THEN
            P.error := "extra header column not in schema"
            FAIL P.error
        END IF
    END FOR
END
# STATE AFTER INDEX_HEADER:
#   source_text      = full
#   physical_lines   = full
#   logical_records  = full
#   header_tokens    = full
#   header_to_source = full mapping
#   rows             = empty
#   error            = empty or full error message on failure


PROCEDURE PARSE_ROWS(P : INOUT Parser, D : Descriptor)
    IF LENGTH(P.logical_records) < 1 THEN
        P.error := "header not indexed"
        FAIL P.error
    END IF

    P.rows := EMPTY LIST

    FOR r FROM 1 TO LENGTH(P.logical_records) - 1
        rec := P.logical_records[r]

        cells_result := SPLIT_CSV_RECORD(rec)
        IF cells_result IS FAIL THEN
            P.error := cells_result.error
            FAIL P.error
        END IF

        cells := cells_result.value

        IF LENGTH(cells) != D.field_count THEN
            P.error := "row has wrong number of columns"
            FAIL P.error
        END IF

        row := EMPTY_RECORD_OF(D.row_shape)

        FOR i FROM 0 TO D.field_count - 1
            source_col := P.header_to_source[i]
            tok := cells[source_col]

            decoded := DECODE_CELL(D.field_kind[i], tok)
            IF decoded IS FAIL THEN
                P.error := "row " + TEXT_FROM_NUMBER(r) + ", field " + D.field_name[i] + ": " + decoded.error
                FAIL P.error
            END IF

            SET_FIELD(row, D.field_name[i], decoded.value)
        END FOR

        APPEND P.rows, row
    END FOR
END
# STATE AFTER PARSE_ROWS:
#   source_text      = full
#   physical_lines   = full
#   logical_records  = full
#   header_tokens    = full
#   header_to_source = full mapping
#   rows             = full typed row list
#   error            = empty or full error message on failure


PROCEDURE VALIDATE_ROWS(P : INOUT Parser, D : Descriptor)
    FOR each row IN P.rows
        FOR i FROM 0 TO D.field_count - 1
            field_name := D.field_name[i]
            checks := D.field_checks[i]
            kind := D.field_kind[i]
            value := GET_FIELD(row, field_name)

            checked := CHECK_VALUE(kind, value, checks)
            IF checked IS FAIL THEN
                P.error := "validation failed for field " + field_name + ": " + checked.error
                FAIL P.error
            END IF
        END FOR
    END FOR
END
# STATE AFTER VALIDATE_ROWS:
#   rows = full and validated
#   every field satisfies its schema checks
#   no type conversion remains undone
#   error = empty or full error message on failure


FUNCTION RENDER(P : Parser, D : Descriptor) RETURNS TEXT
    out := ""

    # Write header in schema order.
    FOR i FROM 0 TO D.field_count - 1
        IF i > 0 THEN
            out := out + ","
        END IF
        out := out + FORMAT_TEXT(D.field_name[i])
    END FOR
    out := out + "\n"

    # Write rows in schema order.
    FOR each row IN P.rows
        FOR i FROM 0 TO D.field_count - 1
            IF i > 0 THEN
                out := out + ","
            END IF

            field_name := D.field_name[i]
            kind := D.field_kind[i]
            value := GET_FIELD(row, field_name)

            out := out + FORMAT_CELL(kind, value)
        END FOR
        out := out + "\n"
    END FOR

    RETURN out
END
# STATE AFTER RENDER:
#   parser unchanged
#   output text full


# ============================================================
# 12) COMPLETE SAMPLE SCHEMA
# ============================================================

SCHEMA UserRow
    FIELD id      : U64
        CHECK MIN_U64(1)

    FIELD email   : TEXT
        CHECK NONEMPTY
        CHECK CONTAINS("@")
        CHECK CONTAINS(".")

    FIELD active  : BOOL

    FIELD age     : U64
        CHECK RANGE_U64(13, 120)

    FIELD note    : OPTIONAL(TEXT)
END


# Compile-time output for UserRow:
#   field_count = 5
#   row_shape   = record(
#                   id: U64,
#                   email: TEXT,
#                   active: BOOL,
#                   age: U64,
#                   note: Maybe<TEXT>
#                 )
#   generated parse/validate/render code is unrolled for 5 fields
#   no schema introspection remains at runtime


# ============================================================
# 13) DEMO RUN
# ============================================================

PROCEDURE MAIN
    desc := $EXPAND_SCHEMA(UserRow)

    input :=
        "email,id,active,age,note\n" +
        "alice@example.com,1,true,17,\n" +
        "bob@example.org,2,false,21,\"\"\n" +
        "carol@example.net,3,true,34,hello\n"

    p := NEW_PARSER()

    CALL READ(p, input)
    # AFTER READ:
    #   source_text      = full input text
    #   physical_lines   = full list of lines
    #   logical_records  = empty
    #   header_tokens    = empty
    #   header_to_source = empty
    #   rows             = empty
    #   error            = empty

    CALL INDEX_HEADER(p, desc)
    # AFTER INDEX_HEADER:
    #   logical_records  = full
    #   header_tokens    = full header row tokens
    #   header_to_source = full mapping from schema fields to source columns
    #   rows             = empty
    #   header order in input is not important anymore
    #   schema fields are now bound to exact input columns

    CALL PARSE_ROWS(p, desc)
    # AFTER PARSE_ROWS:
    #   rows             = full typed row list
    #   note on row 1 note field = NONE
    #   note on row 2 note field = SOME("")
    #   note on row 3 note field = SOME("hello")
    #   no type conversion is left undone

    CALL VALIDATE_ROWS(p, desc)
    # AFTER VALIDATE_ROWS:
    #   every row obeys the field checks
    #   id > 0
    #   email is nonempty and contains @ and .
    #   age is between 13 and 120

    output := RENDER(p, desc)
    PRINT output

END
```