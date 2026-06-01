//TODO compile AST to WASM

//TODO make the handlers more restrictive to prevent mistakes.

function concat(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/* --------------------------------- Values --------------------------------- */
//TODO test this to make sure that they works properly.
//code from pseudocode in https://en.wikipedia.org/wiki/LEB128
function encodeULEB128(value: number): Uint8Array {
  // unsigned LEB128
  const bytes: number[] = [];
  do {
    let byte = value & 0x7f;
    value >>>= 7;
    if (value !== 0) {
      byte |= 0x80;
    }
    bytes.push(byte);
  } while (value != 0);

  return Uint8Array.from(bytes);
}

function encodeSLEB128(value: number | bigint): Uint8Array {
  // signed LEB128
  if (typeof value === "number") {
    value = BigInt(value);
  }
  const bytes: number[] = [];
  let more = true;

  while (more) {
    const signBit = value & 0x40n;
    let byte = Number(value & 0x7fn);
    value >>= 7n;

    if ((value === 0n && signBit === 0n) || (value === -1n && signBit !== 0n)) {
      more = false;
    } else {
      byte |= 0x80;
    }
    bytes.push(byte);
  }

  return Uint8Array.from(bytes);
}

function encodeName(name: string): Uint8Array {
  return encodeByteVect(new TextEncoder().encode(name));
}

function encodeByteVect(value: Uint8Array) {
  return concat(encodeULEB128(value.length), value);
}

function encodeVect(value: Uint8Array[]) {
  return concat(encodeULEB128(value.length), ...value);
}

/* ---------------------------------- Types --------------------------------- */
enum ValueType {
  i32 = 0x7F,
  i64 = 0x7E,
  f32 = 0x7D,
  f64 = 0x7C,
  v128 = 0x7B,
  funcref = 0x70,
  externref = 0x6F,
}

type NumType = ValueType.i32 | ValueType.i64 | ValueType.f32 | ValueType.f64;
type VectorType = ValueType.v128;
type RefType = ValueType.funcref | ValueType.externref;

function encodeResultType(types: ValueType[]): Uint8Array {
  return encodeVect(types.map((b) => Uint8Array.of(b)));
}

function encodeFunctionType(params: ValueType[], results: ValueType[]): Uint8Array {
  const prefix = Uint8Array.of(0x60);
  return concat(prefix, encodeResultType(params), encodeResultType(results));
}

function encodeLimits(min: number, max?: number): Uint8Array {
  if (max === undefined) {
    return concat(Uint8Array.of(0x00), encodeULEB128(min));
  } else {
    return concat(Uint8Array.of(0x01), encodeULEB128(min), encodeULEB128(max));
  }
}

function encodeMemoryType(min: number, max?: number): Uint8Array {
  return encodeLimits(min, max);
}

function encodeTableType(type: RefType, min: number, max?: number): Uint8Array {
  return concat(Uint8Array.of(type), encodeLimits(min, max));
}

function encodeGlobalType(type: ValueType, mutable: boolean): Uint8Array {
  const mutability = mutable ? 0x01 : 0x00;
  return Uint8Array.of(type, mutability);
}

/* ------------------------------ Instructions ------------------------------ */
enum OpCodes {
  // Control
  unreachable = 0x00,
  nop,
  block,
  loop,
  if,
  br = 0x0c,
  br_if,
  br_table,
  return,
  call = 0x10,
  call_indirect,

  // Reference
  ref_null = 0xD0,
  ref_is_null,
  ref_func,

  // Parametric
  drop = 0x1A,
  select,
  selectT,

  // Variable
  local_get = 0x20,
  local_set,
  local_tee,
  global_get,
  global_set,

  // Table
  table_get,
  table_set,
  /** 0xFC */
  table_init = 12,
  /** 0xFC */
  elem_drop,
  /** 0xFC */
  table_copy,
  /** 0xFC */
  table_grow,
  /** 0xFC */
  table_size,
  /** 0xFC */
  table_fill,

  // Memory
  i32_load = 0x28,
  i64_load,
  f32_load,
  f64_load,
  i32_load8_s,
  i32_load8_u,
  i32_load16_s,
  i32_load16_u,
  i64_load8_s,
  i64_load8_u,
  i64_load16_s,
  i64_load16_u,
  i64_load32_s,
  i64_load32_u,
  i32_store,
  i64_store,
  f32_store,
  f64_store,
  i32_store8,
  i32_store16,
  i64_store8,
  i64_store16,
  i64_store32,
  memory_size,
  memory_grow,
  /** 0xFC */
  memory_init = 8,
  /** 0xFC */
  datas_drop,
  /** 0xFC */
  memory_copy,
  /** 0xFC */
  memory_fill,

  // Numeric
  i32_const = 0x41,
  i64_const,
  f32_const,
  f64_const,

  i32_eqz,
  i32_eq,
  i32_ne,
  i32_lt_s,
  i32_lt_u,
  i32_gt_s,
  i32_gt_u,
  i32_le_s,
  i32_le_u,
  i32_ge_s,
  i32_ge_u,

  i64_eqz,
  i64_eq,
  i64_ne,
  i64_lt_s,
  i64_lt_u,
  i64_gt_s,
  i64_gt_u,
  i64_le_s,
  i64_le_u,
  i64_ge_s,
  i64_ge_u,

  f32_eq,
  f32_ne,
  f32_lt,
  f32_gt,
  f32_le,
  f32_ge,

  f64_eq,
  f64_ne,
  f64_lt,
  f64_gt,
  f64_le,
  f64_ge,

  i32_clz,
  i32_ctz,
  i32_popcnt,
  i32_add,
  i32_sub,
  i32_mul,
  i32_div_s,
  i32_div_u,
  i32_rem_s,
  i32_rem_u,
  i32_and,
  i32_or,
  i32_xor,
  i32_shl,
  i32_shr_s,
  i32_shr_u,
  i32_rotl,
  i32_rotr,

  i64_clz,
  i64_ctz,
  i64_popcnt,
  i64_add,
  i64_sub,
  i64_mul,
  i64_div_s,
  i64_div_u,
  i64_rem_s,
  i64_rem_u,
  i64_and,
  i64_or,
  i64_xor,
  i64_shl,
  i64_shr_s,
  i64_shr_u,
  i64_rotl,
  i64_rotr,

  f32_abs,
  f32_neg,
  f32_ceil,
  f32_floor,
  f32_trunc,
  f32_nearest,
  f32_sqrt,
  f32_add,
  f32_sub,
  f32_mul,
  f32_div,
  f32_min,
  f32_max,
  f32_copysign,

  f64_abs,
  f64_neg,
  f64_ceil,
  f64_floor,
  f64_trunc,
  f64_nearest,
  f64_sqrt,
  f64_add,
  f64_sub,
  f64_mul,
  f64_div,
  f64_min,
  f64_max,
  f64_copysign,

  i32_wrap_i64,
  i32_trunc_f32_s,
  i32_trunc_f32_u,
  i32_trunc_f64_s,
  i32_trunc_f64_u,
  i64_extend_i32_s,
  i64_extend_i32_u,
  i64_trunc_f32_s,
  i64_trunc_f32_u,
  i64_trunc_f64_s,
  i64_trunc_f64_u,
  f32_convert_i32_s,
  f32_convert_i32_u,
  f32_convert_i64_s,
  f32_convert_i64_u,
  f32_demote_f64,
  f64_convert_i32_s,
  f64_convert_i32_u,
  f64_convert_i64_s,
  f64_convert_i64_u,
  f64_promote_f32,
  i32_reinterpret_f32,
  i64_reinterpret_f64,
  f32_reinterpret_i32,
  f64_reinterpret_i64,

  i32_extend8_s,
  i32_extend16_s,
  i64_extend8_s,
  i64_extend16_s,
  i64_extend32_s,

  /** 0xFC */
  i32_trunc_sat_f32_s = 0,
  /** 0xFC */
  i32_trunc_sat_f32_u,
  /** 0xFC */
  i32_trunc_sat_f64_s,
  /** 0xFC */
  i32_trunc_sat_f64_u,
  /** 0xFC */
  i64_trunc_sat_f32_s,
  /** 0xFC */
  i64_trunc_sat_f32_u,
  /** 0xFC */
  i64_trunc_sat_f64_s,
  /** 0xFC */
  i64_trunc_sat_f64_u,

  // Vector
  /** 0xFD */
  v128_load = 0,
  /** 0xFD */
  v128_load8x8_s,
  /** 0xFD */
  v128_load8x8_u,
  v128_load16x4_s,
  /** 0xFD */
  v128_load16x4_u,
  /** 0xFD */
  v128_load32x2_s,
  /** 0xFD */
  v128_load32x2_u,
  /** 0xFD */
  v128_load8_splat,
  /** 0xFD */
  v128_load16_splat,
  /** 0xFD */
  v128_load32_splat,
  /** 0xFD */
  v128_load64_splat,
  /** 0xFD */
  v128_store,
  /** 0xFD */
  v128_load8_lane = 84,
  /** 0xFD */
  v128_load16_lane,
  /** 0xFD */
  v128_load32_lane,
  /** 0xFD */
  v128_load64_lane,
  /** 0xFD */
  v128_store8_lane,
  /** 0xFD */
  v128_store16_lane,
  /** 0xFD */
  v128_store32_lane,
  /** 0xFD */
  v128_store64_lane,
  /** 0xFD */
  v128_load32_zero,
  /** 0xFD */
  v128_load64_zero,

  /** 0xFD */
  v128_const = 12,
  /** 0xFD */
  i8x16_shuffle,

  /** 0xFD */
  i8x16_extract_lane_s = 21,
  /** 0xFD */
  i8x16_extract_lane_u,
  /** 0xFD */
  i8x16_replace_lane,
  /** 0xFD */
  i16x16_extract_lane_s,
  /** 0xFD */
  i16x16_extract_lane_u,
  /** 0xFD */
  i16x16_replace_lane,
  /** 0xFD */
  i32x4_extract_lane,
  /** 0xFD */
  i32x4_replace_lane,
  /** 0xFD */
  i64x2_extract_lane,
  /** 0xFD */
  i64x2_replace_lane,
  /** 0xFD */
  f32x4_extract_lane,
  /** 0xFD */
  f32x4_replace_lane,
  /** 0xFD */
  f64x2_extract_lane,
  /** 0xFD */
  f64x2_replace_lane,

  /** 0xFD */
  i8x16_swizzle = 14,
  /** 0xFD */
  i8x16_splat,
  /** 0xFD */
  i16x8_splat,
  /** 0xFD */
  i32x4_splat,
  /** 0xFD */
  i64x2_splat,
  /** 0xFD */
  f32x4_splat,
  /** 0xFD */
  f64x2_splat,

  end = 0x0B,
}

type BlockTypeOptions = { type: "empty" } | { type: "valtype"; value: ValueType } | { type: "s33"; value: number };
function encodeBlockType(blockType: BlockTypeOptions) {
  if (blockType.type === "empty") {
    return Uint8Array.of(0x40);
  } else if (blockType.type === "valtype") {
    return Uint8Array.of(blockType.value);
  } else {
    return encodeSLEB128(blockType.value);
  }
}

/** @param blockType tells what the block returns */
function encodeBlock(blockType: BlockTypeOptions, instructions: Uint8Array[]) {
  return concat(
    Uint8Array.of(OpCodes.block),
    encodeBlockType(blockType),
    ...instructions,
    Uint8Array.of(0x0B),
  );
}

function encodeLoop(blockType: BlockTypeOptions, instructions: Uint8Array[]) {
  return concat(
    Uint8Array.of(OpCodes.loop),
    encodeBlockType(blockType),
    ...instructions,
    Uint8Array.of(0x0B),
  );
}

function encodeIf(blockType: BlockTypeOptions, consequentInstructions: Uint8Array[], alternateInstructions?: Uint8Array[]) {
  return concat(
    Uint8Array.of(OpCodes.if),
    encodeBlockType(blockType),
    ...consequentInstructions,
    ...(alternateInstructions !== undefined
      ? [
        Uint8Array.of(0x05),
        ...alternateInstructions,
      ]
      : []),
    Uint8Array.of(0x0B),
  );
}

function encodeBr(labelidx: number) {
  return concat(Uint8Array.of(0x0C), encodeULEB128(labelidx));
}

function encodeBrIf(labelidx: number) {
  return concat(Uint8Array.of(0x0D), encodeULEB128(labelidx));
}

function encodeBrTable(labelidx: number) {}

//TODO the rest

function encodeExpression(instructions: Uint8Array) {
  return concat(instructions, Uint8Array.of(OpCodes.end));
}

/* --------------------------------- Modules -------------------------------- */

enum SectionId {
  CUSTOM,
  TYPE,
  IMPORT,
  FUNCTION,
  TABLE,
  MEMORY,
  GLOBAL,
  EXPORT,
  START,
  ELEMENT,
  CODE,
  DATA,
  DATA_COUNT,
}

type SectionMap = {
  [SectionId.CUSTOM]: Uint8Array;
  [SectionId.TYPE]: Uint8Array;
  [SectionId.IMPORT]: Uint8Array;
  [SectionId.FUNCTION]: Uint8Array;
  [SectionId.TABLE]: Uint8Array;
  [SectionId.MEMORY]: Uint8Array;
  [SectionId.GLOBAL]: Uint8Array;
  [SectionId.EXPORT]: Uint8Array;
  [SectionId.START]: Uint8Array;
  [SectionId.ELEMENT]: Uint8Array;
  [SectionId.CODE]: Uint8Array;
  [SectionId.DATA]: Uint8Array;
  [SectionId.DATA_COUNT]: Uint8Array;
};

/** @param size - size of the contents in bytes, */
function encodeSection(id: SectionId, contents: Uint8Array) {
  return concat(
    Uint8Array.of(id),
    encodeULEB128(contents.length),
    contents,
  );
}

function encodeTypeSection(functypes: Uint8Array[]) {
  return encodeSection(
    SectionId.TYPE,
    encodeVect(functypes),
  );
}

enum ImportType {
  func = 0x00,
  table,
  mem,
  global,
}

function encodeImportDesc(type: ImportType, value: Uint8Array) {
  return concat(
    encodeULEB128(type),
    value,
  );
}

function encodeImport(module: string, name: string, desc: Uint8Array) {
  return concat(
    encodeName(module),
    encodeName(name),
    desc,
  );
}

function encodeImportSection(imports: Uint8Array[]) {
  return encodeSection(
    SectionId.IMPORT,
    encodeVect(imports),
  );
}

function encodeFunctionSection(typeidxs: number[]) {
  return encodeSection(
    SectionId.FUNCTION,
    encodeVect(typeidxs.map((v) => encodeULEB128(v))),
  );
}

function encodeTableSection(tabletypes: Uint8Array[]) {
  return encodeSection(
    SectionId.TABLE,
    encodeVect(tabletypes),
  );
}

function encodeMemorySection(memtypes: Uint8Array[]) {
  return encodeSection(
    SectionId.MEMORY,
    encodeVect(memtypes),
  );
}

function encodeGlobal(type: Uint8Array, expression: Uint8Array) {
  return concat(type, expression);
}

function encodeGlobalSection(globals: Uint8Array[]) {
  return encodeSection(
    SectionId.GLOBAL,
    encodeVect(globals),
  );
}

function encodeExportDesc(type: ImportType, value: Uint8Array) {
  return concat(
    encodeULEB128(type),
    value,
  );
}

function encodeExport(name: string, desc: Uint8Array) {
  return concat(
    encodeName(name),
    desc,
  );
}

function encodeExportSection(exports: Uint8Array[]) {
  return encodeSection(
    SectionId.EXPORT,
    encodeVect(exports),
  );
}

function encodeStartSection(funcidx: number) {
  return encodeSection(
    SectionId.START,
    encodeULEB128(funcidx),
  );
}

//TODO encodeElem
function encodeElementSection(elements: Uint8Array[]) {
  return encodeSection(
    SectionId.ELEMENT,
    encodeVect(elements),
  );
}

/** this regroups code and func */
function encodeCode(locals: Uint8Array[], expression: Uint8Array) {
  const contents = concat(
    encodeVect(locals),
    expression,
  );

  return concat(encodeULEB128(contents.length), contents);
}

function encodeLocal(n: number, v: ValueType) {
  return concat(
    encodeULEB128(n),
    encodeULEB128(v),
  );
}

function encodeCodeSection(codeEntries: Uint8Array[]) {
  return encodeSection(
    SectionId.CODE,
    encodeVect(codeEntries),
  );
}

type DataOptions = { init: Uint8Array[] } & ({ mode: "passive" } | { mode: "active"; expr: Uint8Array; memidx?: number });
function encodeData(options: DataOptions) {
  if (options.mode === "passive") {
    return concat(
      encodeULEB128(1),
      encodeVect(options.init),
    );
  } else if (options.memidx !== undefined) {
    return concat(
      encodeULEB128(2),
      encodeULEB128(options.memidx),
      options.expr,
      encodeVect(options.init),
    );
  } else {
    return concat(
      encodeULEB128(0),
      options.expr,
      encodeVect(options.init),
    );
  }
}

function encodeDataSection(data: Uint8Array[]) {
  return encodeSection(
    SectionId.DATA,
    encodeVect(data),
  );
}

function encodeDataCountSection(dataCount: number) {
  return encodeSection(
    SectionId.DATA_COUNT,
    encodeULEB128(dataCount),
  );
}

export function testEmitter() {
  // \0asm
  const magicModuleHeader = [0x00, 0x61, 0x73, 0x6d];
  // WASM version
  const moduleVersion = [0x01, 0x00, 0x00, 0x00];

  const typeSection = encodeTypeSection(
    [encodeFunctionType([ValueType.f32, ValueType.f32], [ValueType.f32])],
  );

  const funcSection = encodeFunctionSection([0x00]);

  const exportSection = encodeExportSection(
    [
      encodeExport(
        "add",
        encodeExportDesc(ImportType.func, encodeULEB128(0x00)),
      ),
    ],
  );

  const codeSection = encodeCodeSection(
    [encodeCode(
      [],
      encodeExpression(concat(
        Uint8Array.of(OpCodes.local_get),
        encodeULEB128(0),
        Uint8Array.of(OpCodes.local_get),
        encodeULEB128(1),
        Uint8Array.of(OpCodes.f32_add),
      )),
    )],
  );

  return Uint8Array.from([
    ...magicModuleHeader,
    ...moduleVersion,
    ...typeSection,
    ...funcSection,
    ...exportSection,
    ...codeSection,
  ]);
  //TODO test
}

/*
compiler:
	take AST, transform it into binary
	make a table of types
	make a table of functions
	export main? or just use a start block.
*/
