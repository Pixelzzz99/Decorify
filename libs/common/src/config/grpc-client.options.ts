import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const clientOptions = {
  inventory: {
    transport: Transport.GRPC,
    options: {
      package: 'inventory',
      protoPath: join(__dirname, '../proto/inventory.proto'),
      url: process.env.INVENTORY_SERVICE_URL || 'localhost:5002',
    },
  } as ClientOptions,
  // ... other service clients
};
