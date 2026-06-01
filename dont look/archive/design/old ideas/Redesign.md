> All of this is not about the syntax, but the conceptual ideas that the syntax will need to do.





# Concrete problems to solve

## Incremental Streaming Parser With Partial Structural Knowledge
parsing a **large structured format**

- optional fields
- conditional sections
- nested structures
- versioned schemas
- fields whose meaning depends on earlier values
- sections that can arrive **out of order**

The parser operates **incrementally** as bytes arrive.
Its state slowly evolves
```
Parser<NothingKnown>  
Parser<VersionKnown>  
Parser<FlagsKnown>  
Parser<MetadataHeaderKnown>  
Parser<MetadataComplete>  
Parser<PayloadStarted>  
Parser<Complete>
```
```
Parser<  
	version = 3,  
	flags = {COMPRESSED, HAS_METADATA},  
	metadata_entries = 5,  
	metadata_parsed = 2  
>
```

```
Parser<Flags = {HAS_METADATA}> requires metadata
Parser<Flags = {}> forbids metadata
```

```
parser.metadata.entries[3] // must fail if metadata_parsed < 4
```

### Features
complex type with conditional (conditional types + union + intersection)
calling a function changes the typestate











