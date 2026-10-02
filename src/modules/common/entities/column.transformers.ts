import { ValueTransformer } from 'typeorm';

// pg trả bigint về string, đổi sang number (an toàn tới 2^53, đủ cho tiền VND)
export const bigintToNumber: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};
