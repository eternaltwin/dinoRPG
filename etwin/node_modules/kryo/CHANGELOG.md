# 0.11.1 (2020-10-22)

- **[Feature]** Add support for generic types.
- **[Feature]** Add record derivation helpers.

# 0.11.0 (2020-06-01)

- **[Breaking change]** Require Node 14.
- **[Breaking change]** Type `test` and `testError` argument as `unknown`.
- **[Fix]** Fix compilation error with TypeScript 3.9.
- **[Fix]** Update dependencies

# 0.10.0 (2020-04-10)

- **[Breaking change]** Move format support to their own packages: `kryo-bson`, `kryo-json` and `kryo-qs`.
- **[Breaking change]** Rename `DocumentType` to `RecordType`.
- **[Breaking change]** Move `CaseStyle` to main exports.
- **[Breaking change]** Move `types/` module to the library root.
- **[Breaking change]** Rename `core.js` to `index.js`.
- **[Breaking change]** Move builtin types to the module defining the corresponding type.

# 0.9.0 (2020-04-04)

- **[Breaking change]** Require Node `13.7`.
- **[Breaking change]** Publish the library as ESM.
- **[Fix]** Update dependencies.
- **[Fix]** Update build tools.
- **[Fix]** Update README badges.
- **[Internal]** Drop Gulp dependency.

# 0.8.1 (2019-01-03)

- **[Feature]** Add `$Null` builtin.
- **[Feature]** Add `minLength` option to `ArrayType`.
- **[Fix]** Fix `TsEnumType` name.
- **[Fix]** Restore `assumeStringKey` option for `MapType`.

# 0.8.0 (2018-12-03)

- **[Breaking change]** Change `variantRead` result from `[variant, value]` to `{variant, value}`.
- **[Breaking change]** Require `unorm` in `CodepointString` constructor.
- **[Feature]** Update to Typescript 3.2.
- **[Feature]** First class ESM support.
- **[Fix]** Replace fake property assignations by property existence assertions.
- **[Internal]** Update dependencies.

# 0.7.0 (2018-02-26)

- **[Breaking change]** Rename `buffer` to `bytes` (`BufferType` to `BytesType`,
  `fromBuffer` to `fromBytes`, etc.)
- **[Breaking change]** Rename `kryo/types` to `kryo/core` to avoid confusion with the `types`
  directory.
- **[Breaking change]** Make `.testError` optional.
- **[Feature]** Add `Ord` interface for types supporting comparison. Implement it to provide total
  order for float64, integer, date, bytes and boolean.
- **[Feature]** Add `$Bytes` and `$Ucs2String` builtins.
- **[Internal]** Remove unused `json` namespaces.
- **[Internal]** Update dependencies

# 0.7.0-beta.2 (2018-02-07)

- **[Fix]** Publish source `.ts` files in a different directory than the corresponding `.js` and `.d.ts`.

# 0.7.0-beta.1 (2018-02-03)

- **[Feature]** Add builtin `$Any` for `AnyType`.
- **[Fix]** Fix typo `DocumenIoType` to `DocumentIoType`.
- **[Fix]** Fix inference on `ArrayType` from its `itemType` (`IoType` or simple `Type`).
- **[Fix]** Fix inference on `LiteralType` from its `type` (`IoType` or simple `Type`).

# 0.7.0-beta.0 (2018-02-03)

- **[Breaking change]** Remove `.readJson`, `.readTrustedJson`, `.writeJson` and serializers in
  favor of `.read`, `.write` and `Writer`/`Reader` interfaces to better support various formats.
- **[Breaking change]** Rename `SimpleEnumType` to `TsEnumType`
- **[Breaking change]** Rename `.rename` to `.changeCase` in `DocumentTypeOptions` and `TsEnumOptions`
- **[Feature]** Support string values for enums
- **[Feature]** Add support for custom renames for documents and enums
- **[Feature]** Read/Write from JSON, BSON and qs strings or buffers directly

# 0.6.1 (2018-01-30)

- **[Fix]** Use `{}` instead of `Object.create(null)` when creating new objects in `DocumentType`.
  Quickfix for [chaijs/deep-eql#51](https://github.com/chaijs/deep-eql/issues/51).

# 0.6.0 (2018-01-29)

- **[Breaking change]** Remove index module, you need to import specific modules with deep imports
  such as `import { DocumentType } from "kryo/types/document"`.
- **[Breaking change]** Rename `int32` export to `integer`
- **[Breaking change]** Rename `typed-enum` to `white-list`
- **[Breaking change]** Move serialization functions out of types, use first-class serializer
  objects to serialize values.
- **[Breaking change]** Rename `WrongType` error to `InvalidType` error
- **[Breaking change]** Remove namespace for errors: define `Name`, `Data` and `Cause` as
  module exports (`import { Data } from "kryo/errors/extra-keys"` instead of
  `import { ExtraKeysError } from from "kryo/errors/extra-keys"; ExtraKeysError.Data`)
- **[Breaking change]** Require stricter type annotations for `LiteralType`
- **[Breaking change]** Rename the options of `Float64` from `notNan` and `notInfinity` to
  `allowNaN` and `allowInfinity`. The behavior of the default remains the same.
- **[Breaking change]** Remove `lazy` flags from constructors. Wrap options in functions to get
  lazy evaluation. `new DocumentType(opts, true)` becomes `new DocumentType(() => opts)`
- **[Feature]** Add support for ESM (publish `.mjs` files)
- **[Feature]** Add `CustomType` to facilitate serialization of non-Kryo types
- **[Feature]** Add `$UuidHex` builtin
- **[Feature]** Report all errors when reading and testing document types
- **[Fix]** Support `.equals` for object arrays.
- **[Fix]** Fix support for `WhiteListType` allowing to create lighter unions of literals.
- **[Internal]** Remove `Type` aliases from each type module:
  `import { Type } from "kryo/types/integer"` was an alias of
  `import { IntegerType } from "kryo/types/integer"`
- **[Internal]** Rename `_helpers/rename` to `case-style`.
- **[Internal]** Remove `NotSyncType` error.
- **[Internal]** Run tests and coverage against `.mjs` only.

# 0.5.0 (2018-01-02)

- **[Fix]** Update dependencies
- **[Internal]** Enable Greenkeeper
- **[Internal]** Enable Codecov

# 0.5.0-alpha.14 (2017-08-17)

- **[Fix]** Fix published package.

# 0.5.0-alpha.13 (2017-08-17)

- **[Feature]** Add `TryUnion` type
- **[Feature]** Add methods to get the variant used by union types.

# 0.5.0-alpha.12 (2017-08-16)

- **[Fix]** Support lazy options for `TaggedUnion`.

# 0.5.0-alpha.11 (2017-08-15)

- **[Feature]** Add free-form JSON type, contains any valid `JSON` value.
- **[Feature]** Support lazy options definition. Instead of an option object, you can now pass a function returning an
  option object. It will be evaluated only once one of its values is needed. This enables circular dependencies.
- **[Internal]** Update build tools.

# 0.5.0-alpha.10 (2017-08-11)

- **[Breaking]** Replace `"browser"` with ES5 CommonJS modules by `"module""` with ES6 modules in `package.json`
- **[Breaking]** Drop library support of ES5, use a shim or transpiler if needed.
- **[Breaking]** Mark `unorm` and `bson` as optional dependencies.
- **[Breaking]** Drop support for ES modules in favor of deep package imports.
- **[Feature]** Provide experimental deep-require support.
- **[Internal]** Convert gulpfile to Typescript.
- **[Internal]** Add `yarn.lock` to better support Yarn.
- **[Internal]** Refactor library to prepare support for deep package imports
  (`import {IntegerType} from "kryo/integer"`)

# 0.5.0-alpha.9 (2017-07-14)

- **[Fix]** Treat `{foo: undefined}` as `{}` if `foo` is an optional document property.

# 0.5.0-alpha.8 (2017-07-13)

- **[Fix]** Mark `bson` as a normal dependency (instead of a dev dependency).

# 0.5.0-alpha.7 (2017-07-10)

- **[Feature]** Implement `BufferType`
- **[Fix]** `ArrayType#read` now uses `itemType.read` (instead of `.readTrusted`).
- **[Fix]** Do not type value for `readMatcher` and `readMatcher`, used by the general `UnionType`.

# 0.5.0-alpha.6

- **[Feature]** Implement `MapType`
- **[Internal]** Update build-tools to use TSLint 8

# 0.5.0-alpha.5

- **[Patch]** Export `TaggedUnionType`

# 0.5.0-alpha.4

- **[Feature]** Implement `LiteralType`
- **[Feature]** Implement `UnionType`
- **[Feature]** Implement `TaggedUnionType`. This is a subclass of UnionType to simplify
  the definition of unions of documents with a "tag property". The tag property acts as
  a discriminant and allows to retrieve the type of the whole document.
- **[Feature]** Add the `rename` option to `DocumentType`. This allows to rename
  the keys of the document similarly to the values of `SimpleEnumType`.
- **[Patch]** Fix the constraints for `SerializableType` generics.
  `Output` should extend `Input`. This restores the order `T`, `Format`,`Input`, `Output`.
- **[Internal]** Fix documentation generation with typedoc
- **[Internal]** Improve support for the tests checking the output of `.write`
- **[Internal]** Drop `lodash` dependency

# 0.5.0-alpha.3

- **[Feature]** Add support for the `"qs"` format for [the `qs` package][npm-qs] (used by [`express`][npm-express])
- **[Internal]** Create CHANGELOG.md

[npm-express]:https://www.npmjs.com/package/expess
[npm-qs]:https://www.npmjs.com/package/qs
