// types
// i8, i16, i32, i64, u8, u16, u32, u64, f32, f64, bool
// type casting and implicit casting
"var a: int32 = 5; var b: int64 = a as int64; print b;";
"...";

// test each operators with each type and check that they match what we expect.
// establish rules for what type can be with what other type, and how we should convert them
"var a: ${type} = 5; var b: ${type} = 3; print a ${bin_operator} b";
