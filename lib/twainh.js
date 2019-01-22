///////////////////////////////////////////////////////////////////////////////
//
// TWainWorkingGroup.TWAIN
//
//  These are the definitions for TWAIN.  They're essentially the C/C++
//  TWAIN.H file contents translated to JavaScript, on top of Node.js using the
//  "ref" type interface, with modifications that recognize the differences
//  between Windows, Linux and Mac OS X.
//
///////////////////////////////////////////////////////////////////////////////
const twainh = require("bindings")("twainh");

const ffi = require("ffi");
const ref = require("ref");
ref.types.array = require("ref-array");
ref.types.struct = require("ref-struct");
ref.types.union = require("ref-union");

/****************************************************************************
 * TWAIN Version                                                            *
 ****************************************************************************/
const TWON_PROTOCOLMINOR = 4;
const TWON_PROTOCOLMAJOR = 2;

/****************************************************************************
 * Platform Dependent Definitions and Typedefs                              *
 ****************************************************************************/
const TWH_32BIT = process.arch === "x32";
const TWH_64BIT = process.arch === "x64";

const TWH_CMP_MSC = process.platform === "win32";
const TWH_CMP_OSX = process.platform === "darwin";
const TWH_CMP_LINUX = process.platform === "linux";

const TW_HANDLE = ref.refType(ref.types.void); // HANDLE (PVOID) vs Handle vs void*
const TW_MEMREF = ref.refType(ref.types.void); // LPVOID vs char* vs void*

// UINT_PTR - An unsigned integer, whose length is dependent on processor word size.
// https://msdn.microsoft.com/en-us/library/cc248915.aspx
const TW_UINTPTR = TWH_CMP_MSC
  ? /*TWH_32BIT
    ? */ ref.types.uint
  : //: ref.types.uint64  // didn't hold true on windows 10 x64
  TWH_32BIT
  ? ref.types.ulong
  : ref.types.ulonglong;

/* Set the packing: this occurs before any structures are defined */
// @TODO have to test for various platform/arch combinations since:
//  TWH_CMP_MSC, TWH_CMP_GNU: #pragma pack(2)
//  __APPLE__: #pragma options align = power
//  TWH_CMP_BORLAND: #pragma option -a2
const TW_PACKED = { packed: TWH_CMP_OSX ? false : 2 };

/****************************************************************************
 * Type Definitions                                                         *
 ****************************************************************************/

// since ref.types.char and ref.types.uchar are identical platform check(osx) is not req'd
const TW_STR32 = ref.types.array("char", 34);
const TW_STR64 = ref.types.array("char", 66);
const TW_STR128 = ref.types.array("char", 130);
const TW_STR255 = ref.types.array("char", 256);

/* Numeric types. */
const TW_INT8 = ref.types.char;
const TW_INT16 = ref.types.short;
const TW_INT32 = TWH_CMP_OSX ? ref.types.int : ref.types.long;

const TW_UINT8 = ref.types.uchar;
const TW_UINT16 = ref.types.ushort;
const TW_UINT32 = TWH_CMP_OSX ? ref.types.uint : ref.types.ulong;
const TW_BOOL = ref.types.ushort;

/****************************************************************************
 * Structure Definitions                                                    *
 ****************************************************************************/

/* Fixed point structure type. */
const TW_FIX32 = ref.types.struct(
  {
    Whole: TW_INT16,
    Frac: TW_UINT16
  },
  TW_PACKED
);

/* Defines a frame rectangle in const ICAP_UNITS coordinates. */
const TW_FRAME = ref.types.struct(
  {
    Left: TW_FIX32,
    Top: TW_FIX32,
    Right: TW_FIX32,
    Bottom: TW_FIX32
  },
  TW_PACKED
);

/* Defines the parameters used for channel-specific transformation. */
const TW_DECODEFUNCTION = ref.types.struct(
  {
    StartIn: TW_FIX32,
    BreakIn: TW_FIX32,
    EndIn: TW_FIX32,
    StartOut: TW_FIX32,
    BreakOut: TW_FIX32,
    EndOut: TW_FIX32,
    Gamma: TW_FIX32,
    SampleCount: TW_FIX32
  },
  TW_PACKED
);

/* Stores a Fixed point number in two parts, a whole and a fractional part. */
const TW_TRANSFORMSTAGE = ref.types.struct(
  {
    Decode: ref.types.array(TW_DECODEFUNCTION, 3),
    Mix: ref.types.array(ref.types.array(TW_FIX32, 3), 3)
  },
  TW_PACKED
);

/* Container for array of values */
// @TODO MSCx64 twain.h size: 8 local: 7; pack(2) issue?
const TW_ARRAY = ref.types.struct(
  {
    ItemType: TW_UINT16,
    NumItems: TW_UINT32,
    ItemList: ref.types.array(TW_UINT8, 1)
  },
  TW_PACKED
);

/* Information about audio data */
const TW_AUDIOINFO = ref.types.struct(
  {
    Name: TW_STR255,
    Reserved: TW_UINT32
  },
  TW_PACKED
);

/* Used to register callbacks. */
const TW_CALLBACK = ref.types.struct(
  {
    CallBackProc: TW_MEMREF,
    RefCon: TWH_CMP_OSX ? TW_MEMREF : TW_UINT32,
    Message: TW_INT16
  },
  TW_PACKED
);

/* Used to register callbacks. */
const TW_CALLBACK2 = ref.types.struct(
  {
    CallBackProc: TW_MEMREF,
    RefCon: TW_UINTPTR,
    Message: TW_INT16
  },
  TW_PACKED
);

/* Used by application to get/set capability from/in a data source. */
const TW_CAPABILITY = ref.types.struct(
  {
    Cap: TW_UINT16,
    ConType: TW_UINT16,
    hContainer: TW_HANDLE
  },
  TW_PACKED
);

/* Defines a CIE XYZ space tri-stimulus value. */
const TW_CIEPOINT = ref.types.struct(
  {
    X: TW_FIX32,
    Y: TW_FIX32,
    Z: TW_FIX32
  },
  TW_PACKED
);

/* Defines the mapping from an RGB color space device into CIE 1931 (XYZ) color space. */
const TW_CIECOLOR = ref.types.struct(
  {
    ColorSpace: TW_UINT16,
    LowEndian: TW_INT16,
    DeviceDependent: TW_INT16,
    VersionNumber: TW_INT32,
    StageABC: TW_TRANSFORMSTAGE,
    StageLMN: TW_TRANSFORMSTAGE,
    WhitePoint: TW_CIEPOINT,
    BlackPoint: TW_CIEPOINT,
    WhitePaper: TW_CIEPOINT,
    BlackInk: TW_CIEPOINT,
    Samples: ref.types.array(TW_FIX32, 1)
  },
  TW_PACKED
);

/* Allows for a data source and application to pass custom data to each other. */
const TW_CUSTOMDSDATA = ref.types.struct(
  {
    InfoLength: TW_UINT32,
    hData: TW_HANDLE
  },
  TW_PACKED
);

/* Provides information about the Event that was raised by the Source */
const TW_DEVICEEVENT = ref.types.struct(
  {
    Event: TW_UINT32,
    DeviceName: TW_STR255,
    BatteryMinutes: TW_UINT32,
    BatteryPercentage: TW_INT16,
    PowerSupply: TW_INT32,
    XResolution: TW_FIX32,
    YResolution: TW_FIX32,
    FlashUsed2: TW_UINT32,
    AutomaticCapture: TW_UINT32,
    TimeBeforeFirstCapture: TW_UINT32,
    TimeBetweenCaptures: TW_UINT32
  },
  TW_PACKED
);

/* This structure holds the tri-stimulus color palette information for TW_PALETTE8 structures.*/
const TW_ELEMENT8 = ref.types.struct(
  {
    Index: TW_UINT8,
    Channel1: TW_UINT8,
    Channel2: TW_UINT8,
    Channel3: TW_UINT8
  },
  TW_PACKED
);

/* Stores a group of individual values describing a capability. */
// @TODO MSCx64 twain.h size: 16 local: 15; pack(2) issue?
const TW_ENUMERATION = ref.types.struct(
  {
    ItemType: TW_UINT16,
    NumItems: TW_UINT32,
    CurrentIndex: TW_UINT32,
    DefaultIndex: TW_UINT32,
    ItemList: ref.types.array(TW_UINT8, 1)
  },
  TW_PACKED
);

/* Used to pass application events/messages from the application to the Source. */
const TW_EVENT = ref.types.struct(
  {
    pEvent: TW_MEMREF,
    TWMessage: TW_UINT16
  },
  TW_PACKED
);

/* This structure is used to pass specific information between the data source and the application. */
const TW_INFO = ref.types.struct(
  {
    InfoID: TW_UINT16,
    ItemType: TW_UINT16,
    NumItems: TW_UINT16,
    Union: ref.types.union({
      ReturnCode: TW_UINT16,
      CondCode: TW_UINT16 // Deprecated, do not use
    }),
    Item: TW_UINTPTR
  },
  TW_PACKED
);

const TW_EXTIMAGEINFO = ref.types.struct(
  {
    NumInfos: TW_UINT32,
    Info: ref.types.array(TW_INFO, 1)
  },
  TW_PACKED
);

/* Provides information about the currently selected device */
const TW_FILESYSTEM = ref.types.struct(
  {
    InputName: TW_STR255,
    OutputName: TW_STR255,
    Context: TW_MEMREF,
    UnionSubDirectories: ref.types.union({
      Recursive: ref.types.int,
      Subdirectories: TW_BOOL
    }),
    UnionFileType: ref.types.union({
      FileType: TW_INT32,
      FileSystemType: TW_UINT32
    }),
    Size: TW_UINT32,
    CreateTimeDate: TW_STR32,
    ModifiedTimeDate: TW_STR32,
    FreeSpace: TW_UINT32,
    NewImageSize: TW_INT32,
    NumberOfFiles: TW_UINT32,
    NumberOfSnippets: TW_UINT32,
    DeviceGroupMask: TW_UINT32,
    Reserved: ref.types.array(TW_INT8, 508)
  },
  TW_PACKED
);

/* This structure is used by the application to specify a set of mapping values to be applied to grayscale data. */
const TW_GRAYRESPONSE = ref.types.struct(
  {
    Response: ref.types.array(TW_ELEMENT8, 1)
  },
  TW_PACKED
);

/* A general way to describe the version of software that is running. */
const TW_VERSION = ref.types.struct(
  {
    MajorNum: TW_UINT16,
    MinorNum: TW_UINT16,
    Language: TW_UINT16,
    Country: TW_UINT16,
    Info: TW_STR32
  },
  TW_PACKED
);

/* Provides identification information about a TWAIN entity.*/
const TW_IDENTITY = ref.types.struct(
  {
    Id: TWH_CMP_OSX ? TW_MEMREF : TW_UINT32,
    Version: TW_VERSION,
    ProtocolMajor: TW_UINT16,
    ProtocolMinor: TW_UINT16,
    SupportedGroups: TW_UINT32,
    Manufacturer: TW_STR32,
    ProductFamily: TW_STR32,
    ProductName: TW_STR32
  },
  TW_PACKED
);
const pTW_IDENTITY = ref.refType(TW_IDENTITY);

/* Describes the "real" image data, that is, the complete image being transferred between the Source and application. */
const TW_IMAGEINFO = ref.types.struct(
  {
    XResolution: TW_FIX32,
    YResolution: TW_FIX32,
    ImageWidth: TW_INT32,
    ImageLength: TW_INT32,
    SamplesPerPixel: TW_INT16,
    BitsPerSample: ref.types.array(TW_INT16, 8),
    BitsPerPixel: TW_INT16,
    Planar: TW_BOOL,
    PixelType: TW_INT16,
    Compression: TW_UINT16
  },
  TW_PACKED
);

/* Involves information about the original size of the acquired image. */
const TW_IMAGELAYOUT = ref.types.struct(
  {
    Frame: TW_FRAME,
    DocumentNumber: TW_UINT32,
    PageNumber: TW_UINT32,
    FrameNumber: TW_UINT32
  },
  TW_PACKED
);

/* Provides information for managing memory buffers. */
const TW_MEMORY = ref.types.struct(
  {
    Flags: TW_UINT32,
    Length: TW_UINT32,
    TheMem: TW_MEMREF
  },
  TW_PACKED
);

/* Describes the form of the acquired data being passed from the Source to the application.*/
const TW_IMAGEMEMXFER = ref.types.struct(
  {
    Compression: TW_UINT16,
    BytesPerRow: TW_UINT32,
    Columns: TW_UINT32,
    Rows: TW_UINT32,
    XOffset: TW_UINT32,
    YOffset: TW_UINT32,
    BytesWritten: TW_UINT32,
    Memory: TW_MEMORY
  },
  TW_PACKED
);

/* Describes the information necessary to transfer a JPEG-compressed image. */
const TW_JPEGCOMPRESSION = ref.types.struct(
  {
    ColorSpace: TW_UINT16,
    SubSampling: TW_UINT32,
    NumComponents: TW_UINT16,
    RestartFrequency: TW_UINT16,
    QuantMap: ref.types.array(TW_UINT16, 4),
    QuantTable: ref.types.array(TW_MEMORY, 4),
    HuffmanMap: ref.types.array(TW_UINT16, 4),
    HuffmanDC: ref.types.array(TW_MEMORY, 2),
    HuffmanAC: ref.types.array(TW_MEMORY, 2)
  },
  TW_PACKED
);

/* Collects scanning metrics after returning to state 4 */
const TW_METRICS = ref.types.struct(
  {
    SizeOf: TW_UINT32,
    ImageCount: TW_UINT32,
    SheetCount: TW_UINT32
  },
  TW_PACKED
);

/* Stores a single value (item) which describes a capability. */
const TW_ONEVALUE = ref.types.struct(
  {
    ItemType: TW_UINT16,
    Item: TW_UINT32
  },
  TW_PACKED
);

/* This structure holds the color palette information. */
const TW_PALETTE8 = ref.types.struct(
  {
    NumColors: TW_UINT16,
    PaletteType: TW_UINT16,
    Colors: ref.types.array(TW_ELEMENT8, 256)
  },
  TW_PACKED
);

/* Used to bypass the TWAIN protocol when communicating with a device */
const TW_PASSTHRU = ref.types.struct(
  {
    pCommand: TW_MEMREF,
    CommandBytes: TW_UINT32,
    Direction: TW_INT32,
    pData: TW_MEMREF,
    DataBytes: TW_UINT32,
    DataBytesXfered: TW_UINT32
  },
  TW_PACKED
);

/* This structure tells the application how many more complete transfers the Source currently has available. */
const TW_PENDINGXFERS = ref.types.struct(
  {
    Count: TW_UINT16,
    UnionEOJ: ref.types.union({
      EOJ: TW_UINT32,
      Reserved: TW_UINT32
      // #if defined(__APPLE__) /* cf: Mac version of TWAIN.h */
      //     // union {
      //     TW_UINT32 EOJ,
      //     TW_UINT32 Reserved,
      //     // } TW_JOBCONTROL,
      // #endif
    })
  },
  TW_PACKED
);

/* Stores a range of individual values describing a capability. */
const TW_RANGE = ref.types.struct(
  {
    ItemType: TW_UINT16,
    MinValue: TW_UINT32,
    MaxValue: TW_UINT32,
    StepSize: TW_UINT32,
    DefaultValue: TW_UINT32,
    CurrentValue: TW_UINT32
  },
  TW_PACKED
);

/* This structure is used by the application to specify a set of mapping values to be applied to RGB color data. */
const TW_RGBRESPONSE = ref.types.struct(
  {
    Response: ref.types.array(TW_ELEMENT8, 1)
  },
  TW_PACKED
);

/* Describes the file format and file specification information for a transfer through a disk file. */
const TW_SETUPFILEXFER = ref.types.struct(
  {
    FileName: TW_STR255,
    Format: TW_UINT16,
    VRefNum: TW_INT16
  },
  TW_PACKED
);

/* Provides the application information about the Source's requirements and preferences regarding allocation of transfer buffer(s). */
const TW_SETUPMEMXFER = ref.types.struct(
  {
    MinBufSize: TW_UINT32,
    MaxBufSize: TW_UINT32,
    Preferred: TW_UINT32
  },
  TW_PACKED
);

/* Describes the status of a source. */
const TW_STATUS = ref.types.struct(
  {
    ConditionCode: TW_UINT16,
    Union: ref.types.union({
      Data: TW_UINT16,
      Reserved: TW_UINT16
    })
  },
  TW_PACKED
);

/* Translates the contents of Status into a localized UTF8string. */
const TW_STATUSUTF8 = ref.types.struct(
  {
    Status: TW_STATUS,
    Size: TW_UINT32,
    UTF8string: TW_HANDLE
  },
  TW_PACKED
);

const TW_TWAINDIRECT = ref.types.struct(
  {
    SizeOf: TW_UINT32,
    CommunicationManager: TW_UINT16,
    Send: TW_HANDLE,
    SendSize: TW_UINT32,
    Receive: TW_HANDLE,
    ReceiveSize: TW_UINT32
  },
  TW_PACKED
);

/* This structure is used to handle the user interface coordination between an application and a Source. */
const TW_USERINTERFACE = ref.types.struct(
  {
    ShowUI: TW_BOOL,
    ModalUI: TW_BOOL,
    hParent: TW_HANDLE
  },
  TW_PACKED
);

/****************************************************************************
 * Generic Constants                                                        *
 ****************************************************************************/
// constants come directly from twain.h header file

/****************************************************************************
 * Depreciated Items                                                        *
 ****************************************************************************/
// not implemented

/****************************************************************************
 * Entry Points                                                             *
 ****************************************************************************/

/**********************************************************************
 * Function: DSM_Entry, the only entry point into the Data Source Manager.
 ********************************************************************/

// function definition to be used by node-ffi -> Library
const DSM_Entry = [
  TW_UINT16,
  [
    pTW_IDENTITY, // pOrigin
    pTW_IDENTITY, // pDest
    TW_UINT32, // DG
    TW_UINT16, // DAT
    TW_UINT16, // MSG
    TW_MEMREF // pData
  ]
];

const DSMENTRYPROC = ffi.Function(TW_UINT16, [
  pTW_IDENTITY, // pOrigin
  pTW_IDENTITY, // pDest
  TW_UINT32, // DG
  TW_UINT16, // DAT
  TW_UINT16, // MSG
  TW_MEMREF // pData
]);

/**********************************************************************
 * Function: DS_Entry, the entry point provided by a Data Source.
 ********************************************************************/

// function definition to be used by node-ffi -> Library
const DS_Entry = [
  TW_UINT16,
  [pTW_IDENTITY, TW_UINT32, TW_UINT16, TW_UINT16, TW_MEMREF]
];
const DSENTRYPROC = ffi.Function(TW_UINT16, [
  pTW_IDENTITY, // pOrigin
  TW_UINT32, // DG
  TW_UINT16, // DAT
  TW_UINT16, // MSG
  TW_MEMREF // pData
]);

// function definition to be used by node-ffi -> Library
const TWAIN_Callback = [
  TW_UINT16,
  [pTW_IDENTITY, pTW_IDENTITY, TW_UINT32, TW_UINT16, TW_UINT16, TW_MEMREF]
];
const TWAINCALLBACKPROC = ffi.Function(TW_UINT16, [
  pTW_IDENTITY, // pOrigin
  pTW_IDENTITY, // pDest
  TW_UINT32, // DG
  TW_UINT16, // DAT
  TW_UINT16, // MSG
  TW_MEMREF // pData
]);

// function definition to be used by node-ffi -> Library
const DSM_MemAllocate = [TW_HANDLE, [TW_UINT32]];
const DSM_MEMALLOCATE = ffi.Function(TW_HANDLE, [
  TW_UINT32 // _size
]);

// function definition to be used by node-ffi -> Library
const DSM_MemFree = [ref.types.void, [TW_HANDLE]];
const DSM_MEMFREE = ffi.Function(ref.types.void, [
  TW_HANDLE // _handle
]);

// function definition to be used by node-ffi -> Library
const DSM_MemLock = [TW_MEMREF, [TW_HANDLE]];
const DSM_MEMLOCK = ffi.Function(TW_MEMREF, [
  TW_HANDLE // _handle
]);

// function definition to be used by node-ffi -> Library
const DSM_MemUnlock = [ref.types.void, [TW_HANDLE]];
const DSM_MEMUNLOCK = ffi.Function(ref.types.void, [
  TW_HANDLE // _handle
]);

/* DAT_ENTRYPOINT. returns essential entry points. */
const TW_ENTRYPOINT = ref.types.struct(
  {
    Size: TW_UINT32,
    DSM_Entry: DSMENTRYPROC,
    DSM_MemAllocate: DSM_MEMALLOCATE,
    DSM_MemFree: DSM_MEMFREE,
    DSM_MemLock: DSM_MEMLOCK,
    DSM_MemUnlock: DSM_MEMUNLOCK
  },
  TW_PACKED
);

/* DAT_FILTER */
const TW_FILTER_DESCRIPTOR = ref.types.struct(
  {
    Size: TW_UINT32,
    HueStart: TW_UINT32,
    HueEnd: TW_UINT32,
    SaturationStart: TW_UINT32,
    SaturationEnd: TW_UINT32,
    ValueStart: TW_UINT32,
    ValueEnd: TW_UINT32,
    Replacement: TW_UINT32
  },
  TW_PACKED
);

/* DAT_FILTER */
const TW_FILTER = ref.types.struct(
  {
    Size: TW_UINT32,
    DescriptorCount: TW_UINT32,
    MaxDescriptorCount: TW_UINT32,
    Condition: TW_UINT32,
    hDescriptors: TW_HANDLE
  },
  TW_PACKED
);

module.exports = {
  TWON_PROTOCOLMINOR,
  TWON_PROTOCOLMAJOR,

  TWH_32BIT,
  TWH_64BIT,

  TWH_CMP_MSC,
  TWH_CMP_OSX,
  TWH_CMP_LINUX,

  // types
  TW_HANDLE,
  TW_MEMREF,
  TW_UINTPTR,

  TW_PACKED,

  TW_STR32,
  TW_STR64,
  TW_STR128,
  TW_STR255,

  TW_INT8,
  TW_INT16,
  TW_INT32,
  TW_UINT8,
  TW_UINT16,
  TW_UINT32,
  TW_BOOL,

  // structures
  TW_FIX32,
  TW_FRAME,
  TW_DECODEFUNCTION,
  TW_TRANSFORMSTAGE,
  TW_ARRAY,
  TW_AUDIOINFO,
  TW_CALLBACK,
  TW_CALLBACK2,
  TW_CAPABILITY,
  TW_CIEPOINT,
  TW_CIECOLOR,
  TW_CUSTOMDSDATA,
  TW_DEVICEEVENT,
  TW_ELEMENT8,
  TW_ENUMERATION,
  TW_EVENT,
  TW_INFO,
  TW_EXTIMAGEINFO,
  TW_FILESYSTEM,
  TW_GRAYRESPONSE,
  TW_VERSION,
  TW_IDENTITY,
  TW_IMAGEINFO,
  TW_IMAGELAYOUT,
  TW_MEMORY,
  TW_IMAGEMEMXFER,
  TW_JPEGCOMPRESSION,
  TW_METRICS,
  TW_ONEVALUE,
  TW_PALETTE8,
  TW_PASSTHRU,
  TW_PENDINGXFERS,
  TW_RANGE,
  TW_RGBRESPONSE,
  TW_SETUPFILEXFER,
  TW_SETUPMEMXFER,
  TW_STATUS,
  TW_STATUSUTF8,
  TW_TWAINDIRECT,
  TW_USERINTERFACE,

  // entry points
  DSM_Entry,
  DSMENTRYPROC,
  DS_Entry,
  DSENTRYPROC,

  TWAIN_Callback,
  TWAINCALLBACKPROC,

  DSM_MemAllocate,
  DSM_MEMALLOCATE,
  DSM_MemFree,
  DSM_MEMFREE,
  DSM_MemLock,
  DSM_MEMLOCK,
  DSM_MemUnlock,
  DSM_MEMUNLOCK,

  TW_ENTRYPOINT,
  TW_FILTER_DESCRIPTOR,
  TW_FILTER,

  // constants
  ...require("bindings")("twainh").constants
};
