export const fontFamily = {
  heading: "Sora",
  headingMedium: "Sora-Medium",
  headingSemiBold: "Sora-SemiBold",
  headingBold: "Sora-Bold",

  body: "DMSans",
  bodyMedium: "DMSans-Medium",
  bodySemiBold: "DMSans-SemiBold",
  bodyBold: "DMSans-Bold",
} as const;

export const typography = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: fontFamily.headingBold,
  },
  titleLarge: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: fontFamily.headingBold,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fontFamily.headingSemiBold,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontFamily.bodyMedium,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fontFamily.body,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fontFamily.bodyMedium,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fontFamily.body,
  },
  tiny: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: fontFamily.bodyMedium,
  },
} as const;
