import { NativeModules } from 'react-native';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadModule() {
  // Jest module registry must be cleared before each test so we can swap the
  // mocked native module between test cases.
  jest.resetModules();
  return require('../index') as typeof import('../index');
}

// ---------------------------------------------------------------------------
// Old Architecture path — module present in NativeModules
// ---------------------------------------------------------------------------

describe('Old Architecture (NativeModules)', () => {
  const mockRestart = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    // Simulate the module being registered through the legacy bridge.
    (NativeModules as Record<string, unknown>).RestartApp = { restart: mockRestart };
    mockRestart.mockClear();
  });

  afterEach(() => {
    delete (NativeModules as Record<string, unknown>).RestartApp;
  });

  it('calls the native restart method when invoked via default export', () => {
    const { default: restart } = loadModule();
    restart();
    expect(mockRestart).toHaveBeenCalledTimes(1);
  });

  it('calls the native restart method when invoked via named export', () => {
    const { restart } = loadModule();
    restart();
    expect(mockRestart).toHaveBeenCalledTimes(1);
  });

  it('default export and named export are the same function reference', () => {
    const mod = loadModule();
    expect(mod.default).toBe(mod.restart);
  });
});

// ---------------------------------------------------------------------------
// New Architecture path — module present in TurboModuleRegistry
// ---------------------------------------------------------------------------

describe('New Architecture (TurboModuleRegistry)', () => {
  const mockTurboRestart = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    // Simulate the TurboModule being registered. NativeRestartApp.ts uses
    // TurboModuleRegistry.get(), which react-native's Jest preset exposes via
    // the __turboModuleProxy global mock.
    jest.mock('../NativeRestartApp', () => ({ restart: mockTurboRestart }), {
      virtual: true,
    });
    mockTurboRestart.mockClear();
  });

  it('prefers the TurboModule over the bridge module', () => {
    // Also put something in NativeModules to confirm TurboModule wins.
    const bridgeMock = jest.fn();
    (NativeModules as Record<string, unknown>).RestartApp = { restart: bridgeMock };

    const { default: restart } = loadModule();
    restart();

    expect(mockTurboRestart).toHaveBeenCalledTimes(1);
    expect(bridgeMock).not.toHaveBeenCalled();

    delete (NativeModules as Record<string, unknown>).RestartApp;
  });
});

// ---------------------------------------------------------------------------
// Not linked — neither path has the module
// ---------------------------------------------------------------------------

describe('Module not linked', () => {
  beforeEach(() => {
    jest.resetModules();
    delete (NativeModules as Record<string, unknown>).RestartApp;
    // NativeRestartApp returns null when the module is absent.
    jest.mock('../NativeRestartApp', () => null, { virtual: true });
  });

  it('throws a descriptive error when the module is not linked', () => {
    const { default: restart } = loadModule();
    expect(() => restart()).toThrow(
      "The package 'react-native-restart-app' doesn't seem to be linked"
    );
  });
});
