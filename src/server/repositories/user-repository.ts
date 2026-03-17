import db from '@/lib/db';

export const userRepository = {
  findByEmail(email: string) {
    return db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  },

  createUser(input: { email: string; password: string; name?: string }) {
    return db.user.create({
      data: {
        email: input.email.toLowerCase(),
        password: input.password,
        name: input.name,
      },
    });
  },

  createVerificationToken(input: { email: string; token: string; expires: Date }) {
    return db.verificationToken.create({
      data: {
        identifier: input.email.toLowerCase(),
        token: input.token,
        expires: input.expires,
      },
    });
  },

  invalidateActivePasswordResetTokens(email: string) {
    return db.passwordResetToken.updateMany({
      where: {
        email: email.toLowerCase(),
        used: false,
        expires: { gt: new Date() },
      },
      data: { used: true },
    });
  },

  createPasswordResetToken(input: { email: string; token: string; expires: Date }) {
    return db.passwordResetToken.create({
      data: {
        email: input.email.toLowerCase(),
        token: input.token,
        expires: input.expires,
      },
    });
  },
};
