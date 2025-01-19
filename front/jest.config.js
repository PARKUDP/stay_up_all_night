module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
      '^.+\\.(js|jsx|mjs)$': 'babel-jest',  // JSファイルをBabelで変換
    },
    transformIgnorePatterns: [
      'node_modules/(?!(axios)/)',  // ✅ axios を変換対象にする
    ],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',  // CSSのモック
    },
  };
  