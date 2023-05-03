export default {
    expo: {
      plugins: [
        [
          'expo-build-properties',
          {
            "ios": {
              "useFrameworks": "static"
            }
          },
          {
            "android": {
              "package": "com.tri2820.packer" 
            }
          }
        ],
      ],
    },
  };
  