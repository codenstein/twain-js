#include <nan.h>
#include <string.h>
#include <limits.h>
#include "../twain.h"

using namespace v8;

#undef max

// req'd since size_t are 64-bit values on 64-bit Windows operating systems and
// v8 does not support 64-bit numbers.
int SizeTToInt(size_t data)
{
  if (data > std::numeric_limits<int>::max())
  {
    fprintf(stderr, "%s", "Invalid cast. size_t exceeds the numeric limit of int.\n");
    abort();
  }
  return static_cast<int>(data);
}

#define STR(x) #x

#define ADD_TYPE(types, type)                                                                  \
  {                                                                                            \
    v8::Local<v8::Object> _type = Nan::New<v8::Object>();                                      \
    _type->Set(Nan::New("size").ToLocalChecked(), Nan::New<Number>(SizeTToInt(sizeof(type)))); \
    types->Set(Nan::New(STR(type)).ToLocalChecked(), _type);                                   \
  }

#define ADD_OFFSET(structs, type, member)                                                                                   \
  {                                                                                                                         \
    v8::Local<v8::Object> _type = Nan::To<v8::Object>(structs->Get(Nan::New(STR(type)).ToLocalChecked())).ToLocalChecked(); \
    v8::Local<v8::Object> offsets = Nan::To<v8::Object>(_type->Get(Nan::New("offsets").ToLocalChecked())).ToLocalChecked(); \
    offsets->Set(Nan::New(STR(member)).ToLocalChecked(), Nan::New<Number>(SizeTToInt(offsetof(type, member))));             \
  }

#define ADD_STRUCT(structs, type)                                                                \
  {                                                                                              \
    v8::Local<v8::Object> _struct = Nan::New<v8::Object>();                                      \
    _struct->Set(Nan::New("size").ToLocalChecked(), Nan::New<Number>(SizeTToInt(sizeof(type)))); \
    _struct->Set(Nan::New("offsets").ToLocalChecked(), Nan::New<v8::Object>());                  \
    structs->Set(Nan::New(STR(type)).ToLocalChecked(), _struct);                                 \
  }

void InitTypedefs(v8::Local<v8::Object> exports)
{
  v8::Local<v8::Object> typedefs = Nan::New<v8::Object>();

  v8::Local<v8::Object> types = Nan::New<v8::Object>();
  ADD_TYPE(types, TW_HANDLE);
  ADD_TYPE(types, TW_MEMREF);
  ADD_TYPE(types, TW_UINTPTR);

  ADD_TYPE(types, TW_STR32);
  ADD_TYPE(types, TW_STR64);
  ADD_TYPE(types, TW_STR128);
  ADD_TYPE(types, TW_STR255);

  ADD_TYPE(types, TW_INT8);
  ADD_TYPE(types, TW_INT16);
  ADD_TYPE(types, TW_INT32);

  ADD_TYPE(types, TW_UINT8);
  ADD_TYPE(types, TW_UINT16);
  ADD_TYPE(types, TW_UINT32);
  ADD_TYPE(types, TW_BOOL);
  typedefs->Set(Nan::New("types").ToLocalChecked(), types);

  v8::Local<v8::Object> structs = Nan::New<v8::Object>();

  /* Fixed point structure type. */
  ADD_STRUCT(structs, TW_FIX32);
  ADD_OFFSET(structs, TW_FIX32, Whole);
  ADD_OFFSET(structs, TW_FIX32, Frac);

  /* Defines a frame rectangle in const ICAP_UNITS coordinates. */
  ADD_STRUCT(structs, TW_FRAME);
  ADD_OFFSET(structs, TW_FRAME, Left);
  ADD_OFFSET(structs, TW_FRAME, Top);
  ADD_OFFSET(structs, TW_FRAME, Right);
  ADD_OFFSET(structs, TW_FRAME, Bottom);

  /* Defines the parameters used for channel-specific transformation. */
  ADD_STRUCT(structs, TW_DECODEFUNCTION);
  ADD_OFFSET(structs, TW_DECODEFUNCTION, StartIn);
  ADD_OFFSET(structs, TW_DECODEFUNCTION, BreakIn);
  ADD_OFFSET(structs, TW_DECODEFUNCTION, EndIn);
  ADD_OFFSET(structs, TW_DECODEFUNCTION, StartOut);
  ADD_OFFSET(structs, TW_DECODEFUNCTION, BreakOut);
  ADD_OFFSET(structs, TW_DECODEFUNCTION, EndOut);
  ADD_OFFSET(structs, TW_DECODEFUNCTION, Gamma);
  ADD_OFFSET(structs, TW_DECODEFUNCTION, SampleCount);

  ADD_STRUCT(structs, TW_TRANSFORMSTAGE);
  ADD_OFFSET(structs, TW_TRANSFORMSTAGE, Decode);
  ADD_OFFSET(structs, TW_TRANSFORMSTAGE, Mix);

  ADD_STRUCT(structs, TW_ARRAY);
  ADD_OFFSET(structs, TW_ARRAY, ItemType);
  ADD_OFFSET(structs, TW_ARRAY, NumItems);
  ADD_OFFSET(structs, TW_ARRAY, ItemList);

  ADD_STRUCT(structs, TW_AUDIOINFO);
  ADD_OFFSET(structs, TW_AUDIOINFO, Name);
  ADD_OFFSET(structs, TW_AUDIOINFO, Reserved);

  ADD_STRUCT(structs, TW_CALLBACK);
  ADD_OFFSET(structs, TW_CALLBACK, CallBackProc);
  ADD_OFFSET(structs, TW_CALLBACK, RefCon);
  ADD_OFFSET(structs, TW_CALLBACK, Message);

  ADD_STRUCT(structs, TW_CALLBACK2);
  ADD_OFFSET(structs, TW_CALLBACK2, CallBackProc);
  ADD_OFFSET(structs, TW_CALLBACK2, RefCon);
  ADD_OFFSET(structs, TW_CALLBACK2, Message);

  ADD_STRUCT(structs, TW_CAPABILITY);
  ADD_OFFSET(structs, TW_CAPABILITY, Cap);
  ADD_OFFSET(structs, TW_CAPABILITY, ConType);
  ADD_OFFSET(structs, TW_CAPABILITY, hContainer);

  ADD_STRUCT(structs, TW_CIEPOINT);
  ADD_OFFSET(structs, TW_CIEPOINT, X);
  ADD_OFFSET(structs, TW_CIEPOINT, Y);
  ADD_OFFSET(structs, TW_CIEPOINT, Z);

  ADD_STRUCT(structs, TW_CIECOLOR);
  ADD_OFFSET(structs, TW_CIECOLOR, ColorSpace);
  ADD_OFFSET(structs, TW_CIECOLOR, LowEndian);
  ADD_OFFSET(structs, TW_CIECOLOR, DeviceDependent);
  ADD_OFFSET(structs, TW_CIECOLOR, VersionNumber);
  ADD_OFFSET(structs, TW_CIECOLOR, StageABC);
  ADD_OFFSET(structs, TW_CIECOLOR, StageLMN);
  ADD_OFFSET(structs, TW_CIECOLOR, WhitePoint);
  ADD_OFFSET(structs, TW_CIECOLOR, BlackPoint);
  ADD_OFFSET(structs, TW_CIECOLOR, WhitePaper);
  ADD_OFFSET(structs, TW_CIECOLOR, BlackInk);
  ADD_OFFSET(structs, TW_CIECOLOR, Samples);

  ADD_STRUCT(structs, TW_CUSTOMDSDATA);
  ADD_OFFSET(structs, TW_CUSTOMDSDATA, InfoLength);
  ADD_OFFSET(structs, TW_CUSTOMDSDATA, hData);

  ADD_STRUCT(structs, TW_DEVICEEVENT);
  ADD_OFFSET(structs, TW_DEVICEEVENT, Event);
  ADD_OFFSET(structs, TW_DEVICEEVENT, DeviceName);
  ADD_OFFSET(structs, TW_DEVICEEVENT, BatteryMinutes);
  ADD_OFFSET(structs, TW_DEVICEEVENT, BatteryPercentage);
  ADD_OFFSET(structs, TW_DEVICEEVENT, PowerSupply);
  ADD_OFFSET(structs, TW_DEVICEEVENT, XResolution);
  ADD_OFFSET(structs, TW_DEVICEEVENT, YResolution);
  ADD_OFFSET(structs, TW_DEVICEEVENT, FlashUsed2);
  ADD_OFFSET(structs, TW_DEVICEEVENT, AutomaticCapture);
  ADD_OFFSET(structs, TW_DEVICEEVENT, TimeBeforeFirstCapture);
  ADD_OFFSET(structs, TW_DEVICEEVENT, TimeBetweenCaptures);

  ADD_STRUCT(structs, TW_ELEMENT8);
  ADD_OFFSET(structs, TW_ELEMENT8, Index);
  ADD_OFFSET(structs, TW_ELEMENT8, Channel1);
  ADD_OFFSET(structs, TW_ELEMENT8, Channel2);
  ADD_OFFSET(structs, TW_ELEMENT8, Channel3);

  ADD_STRUCT(structs, TW_ENUMERATION);
  ADD_OFFSET(structs, TW_ENUMERATION, ItemType);
  ADD_OFFSET(structs, TW_ENUMERATION, NumItems);
  ADD_OFFSET(structs, TW_ENUMERATION, CurrentIndex);
  ADD_OFFSET(structs, TW_ENUMERATION, DefaultIndex);
  ADD_OFFSET(structs, TW_ENUMERATION, ItemList);

  ADD_STRUCT(structs, TW_EVENT);
  ADD_OFFSET(structs, TW_EVENT, pEvent);
  ADD_OFFSET(structs, TW_EVENT, TWMessage);

  ADD_STRUCT(structs, TW_INFO);
  ADD_OFFSET(structs, TW_INFO, InfoID);
  ADD_OFFSET(structs, TW_INFO, ItemType);
  ADD_OFFSET(structs, TW_INFO, NumItems);
  ADD_OFFSET(structs, TW_INFO, ReturnCode);
  ADD_OFFSET(structs, TW_INFO, CondCode);
  ADD_OFFSET(structs, TW_INFO, Item);

  ADD_STRUCT(structs, TW_EXTIMAGEINFO);
  ADD_OFFSET(structs, TW_EXTIMAGEINFO, NumInfos);
  ADD_OFFSET(structs, TW_EXTIMAGEINFO, Info);

  ADD_STRUCT(structs, TW_FILESYSTEM);
  ADD_OFFSET(structs, TW_FILESYSTEM, InputName);
  ADD_OFFSET(structs, TW_FILESYSTEM, OutputName);
  ADD_OFFSET(structs, TW_FILESYSTEM, Context);
  ADD_OFFSET(structs, TW_FILESYSTEM, Recursive);
  ADD_OFFSET(structs, TW_FILESYSTEM, Subdirectories);
  ADD_OFFSET(structs, TW_FILESYSTEM, FileType);
  ADD_OFFSET(structs, TW_FILESYSTEM, FileSystemType);
  ADD_OFFSET(structs, TW_FILESYSTEM, Size);
  ADD_OFFSET(structs, TW_FILESYSTEM, CreateTimeDate);
  ADD_OFFSET(structs, TW_FILESYSTEM, ModifiedTimeDate);
  ADD_OFFSET(structs, TW_FILESYSTEM, FreeSpace);
  ADD_OFFSET(structs, TW_FILESYSTEM, NewImageSize);
  ADD_OFFSET(structs, TW_FILESYSTEM, NumberOfFiles);
  ADD_OFFSET(structs, TW_FILESYSTEM, NumberOfSnippets);
  ADD_OFFSET(structs, TW_FILESYSTEM, DeviceGroupMask);
  ADD_OFFSET(structs, TW_FILESYSTEM, Reserved);

  ADD_STRUCT(structs, TW_GRAYRESPONSE);
  ADD_OFFSET(structs, TW_GRAYRESPONSE, Response);

  ADD_STRUCT(structs, TW_VERSION);
  ADD_OFFSET(structs, TW_VERSION, MajorNum);
  ADD_OFFSET(structs, TW_VERSION, MinorNum);
  ADD_OFFSET(structs, TW_VERSION, Language);
  ADD_OFFSET(structs, TW_VERSION, Country);
  ADD_OFFSET(structs, TW_VERSION, Info);

  ADD_STRUCT(structs, TW_IDENTITY);
  ADD_OFFSET(structs, TW_IDENTITY, Id);
  ADD_OFFSET(structs, TW_IDENTITY, Version);
  ADD_OFFSET(structs, TW_IDENTITY, ProtocolMajor);
  ADD_OFFSET(structs, TW_IDENTITY, ProtocolMinor);
  ADD_OFFSET(structs, TW_IDENTITY, SupportedGroups);
  ADD_OFFSET(structs, TW_IDENTITY, Manufacturer);
  ADD_OFFSET(structs, TW_IDENTITY, ProductFamily);
  ADD_OFFSET(structs, TW_IDENTITY, ProductName);

  ADD_STRUCT(structs, TW_IMAGEINFO);
  ADD_OFFSET(structs, TW_IMAGEINFO, XResolution);
  ADD_OFFSET(structs, TW_IMAGEINFO, YResolution);
  ADD_OFFSET(structs, TW_IMAGEINFO, ImageWidth);
  ADD_OFFSET(structs, TW_IMAGEINFO, ImageLength);
  ADD_OFFSET(structs, TW_IMAGEINFO, SamplesPerPixel);
  ADD_OFFSET(structs, TW_IMAGEINFO, BitsPerSample);
  ADD_OFFSET(structs, TW_IMAGEINFO, BitsPerPixel);
  ADD_OFFSET(structs, TW_IMAGEINFO, Planar);
  ADD_OFFSET(structs, TW_IMAGEINFO, PixelType);
  ADD_OFFSET(structs, TW_IMAGEINFO, Compression);

  ADD_STRUCT(structs, TW_IMAGELAYOUT);
  ADD_OFFSET(structs, TW_IMAGELAYOUT, Frame);
  ADD_OFFSET(structs, TW_IMAGELAYOUT, DocumentNumber);
  ADD_OFFSET(structs, TW_IMAGELAYOUT, PageNumber);
  ADD_OFFSET(structs, TW_IMAGELAYOUT, FrameNumber);

  ADD_STRUCT(structs, TW_MEMORY);
  ADD_OFFSET(structs, TW_MEMORY, Flags);
  ADD_OFFSET(structs, TW_MEMORY, Length);
  ADD_OFFSET(structs, TW_MEMORY, TheMem);

  ADD_STRUCT(structs, TW_IMAGEMEMXFER);
  ADD_OFFSET(structs, TW_IMAGEMEMXFER, Compression);
  ADD_OFFSET(structs, TW_IMAGEMEMXFER, BytesPerRow);
  ADD_OFFSET(structs, TW_IMAGEMEMXFER, Columns);
  ADD_OFFSET(structs, TW_IMAGEMEMXFER, Rows);
  ADD_OFFSET(structs, TW_IMAGEMEMXFER, XOffset);
  ADD_OFFSET(structs, TW_IMAGEMEMXFER, YOffset);
  ADD_OFFSET(structs, TW_IMAGEMEMXFER, BytesWritten);
  ADD_OFFSET(structs, TW_IMAGEMEMXFER, Memory);

  ADD_STRUCT(structs, TW_JPEGCOMPRESSION);
  ADD_OFFSET(structs, TW_JPEGCOMPRESSION, ColorSpace);
  ADD_OFFSET(structs, TW_JPEGCOMPRESSION, SubSampling);
  ADD_OFFSET(structs, TW_JPEGCOMPRESSION, NumComponents);
  ADD_OFFSET(structs, TW_JPEGCOMPRESSION, RestartFrequency);
  ADD_OFFSET(structs, TW_JPEGCOMPRESSION, QuantMap);
  ADD_OFFSET(structs, TW_JPEGCOMPRESSION, QuantTable);
  ADD_OFFSET(structs, TW_JPEGCOMPRESSION, HuffmanMap);
  ADD_OFFSET(structs, TW_JPEGCOMPRESSION, HuffmanDC);
  ADD_OFFSET(structs, TW_JPEGCOMPRESSION, HuffmanAC);

  ADD_STRUCT(structs, TW_METRICS);
  ADD_OFFSET(structs, TW_METRICS, SizeOf);
  ADD_OFFSET(structs, TW_METRICS, ImageCount);
  ADD_OFFSET(structs, TW_METRICS, SheetCount);

  ADD_STRUCT(structs, TW_ONEVALUE);
  ADD_OFFSET(structs, TW_ONEVALUE, ItemType);
  ADD_OFFSET(structs, TW_ONEVALUE, Item);

  ADD_STRUCT(structs, TW_PALETTE8);
  ADD_OFFSET(structs, TW_PALETTE8, NumColors);
  ADD_OFFSET(structs, TW_PALETTE8, PaletteType);
  ADD_OFFSET(structs, TW_PALETTE8, Colors);

  ADD_STRUCT(structs, TW_PASSTHRU);
  ADD_OFFSET(structs, TW_PASSTHRU, pCommand);
  ADD_OFFSET(structs, TW_PASSTHRU, CommandBytes);
  ADD_OFFSET(structs, TW_PASSTHRU, Direction);
  ADD_OFFSET(structs, TW_PASSTHRU, pData);
  ADD_OFFSET(structs, TW_PASSTHRU, DataBytes);
  ADD_OFFSET(structs, TW_PASSTHRU, DataBytesXfered);

  ADD_STRUCT(structs, TW_PENDINGXFERS);
  ADD_OFFSET(structs, TW_PENDINGXFERS, Count);
  ADD_OFFSET(structs, TW_PENDINGXFERS, EOJ);
  ADD_OFFSET(structs, TW_PENDINGXFERS, Reserved);

  ADD_STRUCT(structs, TW_RANGE);
  ADD_OFFSET(structs, TW_RANGE, ItemType);
  ADD_OFFSET(structs, TW_RANGE, MinValue);
  ADD_OFFSET(structs, TW_RANGE, MaxValue);
  ADD_OFFSET(structs, TW_RANGE, StepSize);
  ADD_OFFSET(structs, TW_RANGE, DefaultValue);
  ADD_OFFSET(structs, TW_RANGE, CurrentValue);

  ADD_STRUCT(structs, TW_RGBRESPONSE);
  ADD_OFFSET(structs, TW_RGBRESPONSE, Response);

  ADD_STRUCT(structs, TW_SETUPFILEXFER);
  ADD_OFFSET(structs, TW_SETUPFILEXFER, FileName);
  ADD_OFFSET(structs, TW_SETUPFILEXFER, Format);
  ADD_OFFSET(structs, TW_SETUPFILEXFER, VRefNum);

  ADD_STRUCT(structs, TW_SETUPMEMXFER);
  ADD_OFFSET(structs, TW_SETUPMEMXFER, MinBufSize);
  ADD_OFFSET(structs, TW_SETUPMEMXFER, MaxBufSize);
  ADD_OFFSET(structs, TW_SETUPMEMXFER, Preferred);

  ADD_STRUCT(structs, TW_STATUS);
  ADD_OFFSET(structs, TW_STATUS, ConditionCode);
  ADD_OFFSET(structs, TW_STATUS, Data);
  ADD_OFFSET(structs, TW_STATUS, Reserved);

  ADD_STRUCT(structs, TW_STATUSUTF8);
  ADD_OFFSET(structs, TW_STATUSUTF8, Status);
  ADD_OFFSET(structs, TW_STATUSUTF8, Size);
  ADD_OFFSET(structs, TW_STATUSUTF8, UTF8string);

  ADD_STRUCT(structs, TW_TWAINDIRECT);
  ADD_OFFSET(structs, TW_TWAINDIRECT, SizeOf);
  ADD_OFFSET(structs, TW_TWAINDIRECT, CommunicationManager);
  ADD_OFFSET(structs, TW_TWAINDIRECT, Send);
  ADD_OFFSET(structs, TW_TWAINDIRECT, SendSize);
  ADD_OFFSET(structs, TW_TWAINDIRECT, Receive);
  ADD_OFFSET(structs, TW_TWAINDIRECT, ReceiveSize);

  ADD_STRUCT(structs, TW_USERINTERFACE);
  ADD_OFFSET(structs, TW_USERINTERFACE, ShowUI);
  ADD_OFFSET(structs, TW_USERINTERFACE, ModalUI);
  ADD_OFFSET(structs, TW_USERINTERFACE, hParent);

  ADD_STRUCT(structs, TW_ENTRYPOINT);
  ADD_OFFSET(structs, TW_ENTRYPOINT, Size);
  ADD_OFFSET(structs, TW_ENTRYPOINT, DSM_Entry);
  ADD_OFFSET(structs, TW_ENTRYPOINT, DSM_MemAllocate);
  ADD_OFFSET(structs, TW_ENTRYPOINT, DSM_MemFree);
  ADD_OFFSET(structs, TW_ENTRYPOINT, DSM_MemLock);
  ADD_OFFSET(structs, TW_ENTRYPOINT, DSM_MemUnlock);

  ADD_STRUCT(structs, TW_FILTER_DESCRIPTOR);
  ADD_OFFSET(structs, TW_FILTER_DESCRIPTOR, Size);
  ADD_OFFSET(structs, TW_FILTER_DESCRIPTOR, HueStart);
  ADD_OFFSET(structs, TW_FILTER_DESCRIPTOR, HueEnd);
  ADD_OFFSET(structs, TW_FILTER_DESCRIPTOR, SaturationStart);
  ADD_OFFSET(structs, TW_FILTER_DESCRIPTOR, SaturationEnd);
  ADD_OFFSET(structs, TW_FILTER_DESCRIPTOR, ValueStart);
  ADD_OFFSET(structs, TW_FILTER_DESCRIPTOR, ValueEnd);
  ADD_OFFSET(structs, TW_FILTER_DESCRIPTOR, Replacement);

  ADD_STRUCT(structs, TW_FILTER);
  ADD_OFFSET(structs, TW_FILTER, Size);
  ADD_OFFSET(structs, TW_FILTER, DescriptorCount);
  ADD_OFFSET(structs, TW_FILTER, MaxDescriptorCount);
  ADD_OFFSET(structs, TW_FILTER, Condition);
  ADD_OFFSET(structs, TW_FILTER, hDescriptors);

  typedefs->Set(Nan::New("structs").ToLocalChecked(), structs);

  exports->Set(Nan::New("typedefs").ToLocalChecked(), typedefs);
}

NAN_MODULE_INIT(Init)
{
  InitTypedefs(target);
}

NODE_MODULE(twainh, Init);