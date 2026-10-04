jest.mock('sharp', () => ({ __esModule: true, default: jest.fn() }));

import { ImagensRemotasService } from './imagens-remotas.service';
import { SentinelHubService } from './sentinel-hub.service';
import { UploadService } from '../upload/upload.service';

const configurationKeys = [
  'NODE_ENV',
  'SENTINEL_CLIENT_ID',
  'SENTINEL_CLIENT_SECRET',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
  'S3_ENDPOINT',
  'S3_PUBLIC_URL',
] as const;

describe('satellite configuration', () => {
  const originalEnvironment = Object.fromEntries(
    configurationKeys.map((key) => [key, process.env[key]]),
  ) as Record<string, string | undefined>;

  beforeEach(() => {
    configurationKeys.forEach((key) => delete process.env[key]);
  });

  afterEach(() => {
    configurationKeys.forEach((key) => {
      const value = originalEnvironment[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  });

  it('reports the missing Sentinel Hub credentials without exposing values', () => {
    const status = new SentinelHubService().getConfigurationStatus();

    expect(status).toEqual({
      configured: false,
      missing: ['SENTINEL_CLIENT_ID', 'SENTINEL_CLIENT_SECRET'],
    });
  });

  it('requires a public storage endpoint in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.S3_ACCESS_KEY = 'access';
    process.env.S3_SECRET_KEY = 'secret';
    process.env.S3_ENDPOINT = 'https://storage.example.test';

    expect(new UploadService().getConfigurationStatus()).toEqual({
      configured: false,
      missing: ['S3_PUBLIC_URL'],
    });
  });

  it('blocks synchronization before reading parcel data when configuration is incomplete', async () => {
    const sentinel = new SentinelHubService();
    const storage = new UploadService();
    const service = new ImagensRemotasService({} as never, storage, sentinel);

    await expect(service.syncOrganizacao('organization-id')).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'SATELLITE_NOT_CONFIGURED',
        missing: expect.arrayContaining([
          'SENTINEL_CLIENT_ID',
          'SENTINEL_CLIENT_SECRET',
          'S3_ACCESS_KEY',
          'S3_SECRET_KEY',
        ]),
      }),
    });
  });

});
