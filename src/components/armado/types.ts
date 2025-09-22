export type CellStyle = {
  backgroundColor?: string
  color?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  align?:
    | 'left'
    | 'center'
    | 'right'
    | 'fill'
    | 'justify'
    | 'centerContinuous'
    | 'distributed'
    | string
}

export type StyledCell = { value: any; style?: CellStyle }
export type SheetMap = Record<string, StyledCell[][]>