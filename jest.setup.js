require('@testing-library/jest-native/extend-expect');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { server } = require('./src/mocks/server');
const { resetTasks } = require('./src/mocks/handlers');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(async () => {
  server.resetHandlers();
  resetTasks();
  // Sin esto, el estado persistido de una prueba se filtra a la siguiente
  // (mismo objeto en memoria del mock durante todo el archivo de test).
  await AsyncStorage.clear();
});
afterAll(() => server.close());
