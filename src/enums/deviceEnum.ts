/**
 * 设备与标签的公共枚举/选项定义。
 *
 * 说明：
 * 1) 所有“公共且跨页面复用”的设备类型、标签数据类型，统一从这里取；
 * 2) 页面只负责展示，不再重复手写 select option；
 * 3) 如需新增品牌/数据类型，优先改这里，避免后续出现多处不同步。
 */

export enum IotTagDataTypeEnum {
  Float = 'Float',
  Int16 = 'Int16',
  Int32 = 'Int32',
  Bool = 'Bool',
  String = 'String',
  UInt16 = 'UInt16',
  Double = 'Double',
  Byte = 'Byte',
  Word = 'Word',
  DWord = 'DWord',
}

export type DeviceTypeValue =
  | 'SiemensS7'
  | 'ModbusTcp'
  | 'Mitsubishi'
  | 'Omron'
  | 'Inovance'
  | 'OPCUA'
  | 'Delta'
  | 'Keyence'
  | 'Beckhoff'
  | 'BACnet'

export interface DeviceTypeOption {
  value: DeviceTypeValue | string
  label: string
  protocol?: string
}

export const TAG_DATA_TYPE_OPTIONS: Array<{ label: string; value: IotTagDataTypeEnum }> = [
  { label: 'Float', value: IotTagDataTypeEnum.Float },
  { label: 'Int16', value: IotTagDataTypeEnum.Int16 },
  { label: 'Int32', value: IotTagDataTypeEnum.Int32 },
  { label: 'Bool', value: IotTagDataTypeEnum.Bool },
  { label: 'String', value: IotTagDataTypeEnum.String },
  { label: 'UInt16', value: IotTagDataTypeEnum.UInt16 },
  { label: 'Double', value: IotTagDataTypeEnum.Double },
  { label: 'Byte', value: IotTagDataTypeEnum.Byte },
  { label: 'Word', value: IotTagDataTypeEnum.Word },
  { label: 'DWord', value: IotTagDataTypeEnum.DWord },
]

/** 不含 Byte 的数据类型选项（标签创建时 Byte 通常不作为业务数据类型） */
export const TAG_DATA_TYPE_OPTIONS_NO_BYTE = TAG_DATA_TYPE_OPTIONS.filter(
  opt => opt.value !== IotTagDataTypeEnum.Byte,
)

export const DEVICE_TYPE_OPTIONS: DeviceTypeOption[] = [
  { value: 'SiemensS7', label: '西门子 S7', protocol: 'siemens-s7' },
  { value: 'ModbusTcp', label: 'Modbus TCP', protocol: 'modbus-tcp' },
  { value: 'Mitsubishi', label: '三菱 MC', protocol: 'melsec-mc' },
  { value: 'Omron', label: '欧姆龙 FINS', protocol: 'omron-fins-tcp' },
  { value: 'Inovance', label: '汇川', protocol: 'inovance-tcp' },
  { value: 'Delta', label: '台达', protocol: 'delta-tcp' },
  { value: 'Keyence', label: '基恩士', protocol: 'keyence-mc' },
  { value: 'Beckhoff', label: '倍福 ADS', protocol: 'beckhoff-ads' },
  { value: 'OPCUA', label: 'OPC UA', protocol: 'opcua' },
  { value: 'BACnet', label: 'BACnet', protocol: 'bacnet' },
]

export const DEVICE_TYPE_COLOR_MAP: Record<string, string> = {
  SiemensS7: 'blue',
  ModbusTcp: 'green',
  Mitsubishi: 'orange',
  Omron: 'purple',
  Inovance: 'cyan',
  Delta: 'geekblue',
  Keyence: 'gold',
  Beckhoff: 'magenta',
  OPCUA: 'geekblue',
  BACnet: 'default',
}

export const TAG_DATA_TYPE_COLOR_MAP: Record<string, string> = {
  Float: 'blue',
  Int16: 'cyan',
  Int32: 'geekblue',
  Bool: 'orange',
  String: 'purple',
  UInt16: 'green',
  Double: 'magenta',
  Byte: 'gold',
}

export const normalizeDeviceTypeOptions = (list: DeviceTypeOption[]) =>
  list.map(item => ({
    label: item.label,
    value: item.value,
  }))
