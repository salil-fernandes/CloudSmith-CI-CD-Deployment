import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    main: {
      0: "#ffffff",
      1: "#fafafa",
      2: "#161414",
      3: "#000000",
    },
    repopicker: {
      1: "#f4f4f5",
      2: "#212024",
    },
  },
});

export default theme;
