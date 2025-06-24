import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { Policy } from '../policy/policy.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PolicyService } from '../policy/policy.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userService = app.get(UserService);
  const policyRepo = app.get(getRepositoryToken(Policy));

  const superadminEmail = 'superadmin@example.com';
  let superadmin = await userService.findByEmail(superadminEmail, true);
  if (!superadmin) {
    superadmin = await userService.create({
      email: superadminEmail,
      password: 'SuperSecret123!',
    });
    console.log('Created superadmin:', superadminEmail);
  } else {
    console.log('Superadmin already exists:', superadminEmail);
  }

  const existingPolicy = await policyRepo.findOne({
    where: {
      subjectType: 'user',
      subjectId: String(superadmin.id),
      action: 'manage',
      resource: 'all',
    },
  });

  if (!existingPolicy) {
    await policyRepo.save(
      policyRepo.create({
        subjectType: 'user',
        subjectId: String(superadmin.id),
        action: 'manage',
        resource: 'all',
        condition: {},
        description: 'Superadmin full quyền',
      }),
    );
    console.log('Created full-access policy for superadmin');
  } else {
    console.log('Superadmin policy already exists');
  }

  await app.close();
}

bootstrap(); 