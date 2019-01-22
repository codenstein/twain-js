var assert = require("assert");
var twainh = require("bindings")({
  module_root: __dirname,
  bindings: "twainh"
});
var twainhJS = require("../lib/twainh");

// need to create test cases that verify the sizes and offsets of structs
// from native twain.h vs twainh.js (ref-struct)

describe("Validate Type Definitions", function() {
  describe("Types", function() {
    describe("Sizes", function() {
      let types = Object.getOwnPropertyNames(twainh.typedefs.types);
      let ignore = ["TW_HANDLE", "TW_MEMREF"];
      types.forEach(type => {
        if (ignore.includes(type)) {
          return;
        }
        it("#" + type, function() {
          assert.strictEqual(
            twainhJS[type].size,
            twainh.typedefs.types[type].size,
            "Expected sizes to be equal:"
          );
        });
      });
    });
  });
  describe("Structs", function() {
    describe("Sizes", function() {
      let structs = Object.getOwnPropertyNames(twainh.typedefs.structs);
      structs.forEach(struct => {
        it("#" + struct, function() {
          assert.strictEqual(
            twainhJS[struct].size,
            twainh.typedefs.structs[struct].size,
            "Expected sizes to be equal:"
          );
        });
      });
    });
  });
});
