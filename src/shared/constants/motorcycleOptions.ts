import type { SelectOption } from "@/src/shared/components";

export const motorcycleBrandOptions: SelectOption[] = [
  {
    label: "Yamaha",
    value: "yamaha",
  },
  {
    label: "Honda",
    value: "honda",
  },
  {
    label: "Vespa",
    value: "vespa",
  },
  {
    label: "Suzuki",
    value: "suzuki",
  },
  {
    label: "Kawasaki",
    value: "kawasaki",
  },
];

export const motorcycleModelOptionsByBrand: Record<string, SelectOption[]> = {
  yamaha: [
    {
      label: "NMAX",
      value: "nmax",
    },
    {
      label: "Aerox",
      value: "aerox",
    },
    {
      label: "Lexi LX",
      value: "lexi-lx",
    },
    {
      label: "XMAX",
      value: "xmax",
    },
    {
      label: "MT-15",
      value: "mt-15",
    },
    {
      label: "R15",
      value: "r15",
    },
  ],
  honda: [
    {
      label: "PCX",
      value: "pcx",
    },
    {
      label: "Vario",
      value: "vario",
    },
    {
      label: "ADV 160",
      value: "adv-160",
    },
    {
      label: "Beat",
      value: "beat",
    },
    {
      label: "CB150R",
      value: "cb150r",
    },
    {
      label: "CBR150R",
      value: "cbr150r",
    },
  ],
  vespa: [
    {
      label: "Sprint",
      value: "sprint",
    },
    {
      label: "Primavera",
      value: "primavera",
    },
    {
      label: "GTS",
      value: "gts",
    },
    {
      label: "LX",
      value: "lx",
    },
  ],
  suzuki: [
    {
      label: "Satria F150",
      value: "satria-f150",
    },
    {
      label: "GSX-R150",
      value: "gsx-r150",
    },
    {
      label: "GSX-S150",
      value: "gsx-s150",
    },
    {
      label: "Address",
      value: "address",
    },
  ],
  kawasaki: [
    {
      label: "Ninja 250",
      value: "ninja-250",
    },
    {
      label: "Ninja ZX-25R",
      value: "ninja-zx-25r",
    },
    {
      label: "W175",
      value: "w175",
    },
    {
      label: "KLX",
      value: "klx",
    },
  ],
};

export const motorcycleYearOptions: SelectOption[] = Array.from(
  {
    length: 17,
  },
  (_, index) => {
    const year = 2026 - index;

    return {
      label: String(year),
      value: String(year),
    };
  },
);
