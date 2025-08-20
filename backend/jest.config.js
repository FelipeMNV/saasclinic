// jest.config.js
module.exports = {
  // Usa o preset do ts-jest para transpilar TypeScript
  preset: 'ts-jest',

  // Define o ambiente de teste como 'node', que é ideal para backend
  testEnvironment: 'node',

  // Procura por arquivos de teste que terminem com .test.ts ou .spec.ts
  testMatch: ['**/?(*.)+(spec|test).ts'],

  // Ignora a pasta node_modules e a pasta de build (ex: dist)
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};