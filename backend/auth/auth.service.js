const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");

exports.signup = async ({ username, email, password }) => {
  // Check for existing user
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  // Throw errors
  if (existingUser) {
    if (existingUser.username === username)
      throw new Error("USERNAME_ALREADY_EXISTS");
    if (existingUser.email === email) throw new Error("EMAIL_ALREADY_EXISTS");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a user
  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword },
    select: { id: true, username: true, email: true, createdAt: true },
  });

  return user;
};
