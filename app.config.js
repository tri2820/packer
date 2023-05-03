export default {
    expo: {
      plugins: [
        [
          'expo-build-properties',
          {
            "ios": {
              "useFrameworks": "static"
            }
          }
        ],
      ],
    },
  };
  