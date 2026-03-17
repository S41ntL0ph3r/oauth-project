import { auth } from '@/lib/auth';
import { UnauthorizedError, NotFoundError } from '@/server/errors/app-error';
import { userRepository } from '@/server/repositories/user-repository';

export async function requireAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.email) {
    throw new UnauthorizedError();
  }

  const user = await userRepository.findByEmail(session.user.email);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}
