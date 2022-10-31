import { PrismaClient, RoleType } from '@prisma/client';
const prisma = new PrismaClient();
enum PropertyType {
  APARTMENT = 'Apartment' as any,
  HOTEL = 'Hotel' as any,
  HOSTEL = 'Hostel' as any,
  VILLA = 'Villa' as any,
  RESORT = 'Resort' as any,
  BED_AND_BREAKFAST = 'Bed and Breakfast' as any,
  OTHER = 'Other' as any,
}
async function main() {
  // seeding Roles
  if ((await prisma.role.count()) === 0) {
    await prisma.role.createMany({
      data: [
        {
          id: 'admin',
          name: RoleType.ADMIN,
        },
        {
          id: 'guest',
          name: RoleType.GUEST,
        },
        {
          id: 'host',
          name: RoleType.HOST,
        },
      ],
    });
  }
  // seeding Users
  if ((await prisma.user.count()) === 0) {
    // seed a Guest
    await prisma.user.create({
      data: {
        roleId: 'guest',
        email: 'johndoe@email.com',
        password: 'password',
        name: 'John Doe',
        phone: '1234567890',
        isVerified: true,
      },
    });
    // seed a Host
    await prisma.user.create({
      data: {
        roleId: 'host',
        email: 'janedoe@email.com',
        password: 'password',
        name: 'Jane Doe',
        phone: '0987654321',
        isVerified: true,
      },
    });
  }
  // seeding Categories
  const categories = [
    'Hotel',
    'Hostel',
    'Villa',
    'Resort',
    'Apartment',
    'Bed and Breakfast',
    'Other',
  ];
  if ((await prisma.category.count()) === 0) {
    await prisma.category.createMany({
      data: categories.map((name) => ({
        id: PropertyType[name],
        name,
      })),
    });
  }

  await prisma.property.create({
    data: {
      name: 'The Grand Hotel',
      description:
        'The Grand Hotel is a 5-star hotel in the heart of the city.',
      streetAddress: '123 Main Street',
      latitude: 40.7128,
      longitude: 74.006,
      location: {
        city: {
          id: 'new-york',
          name: 'New York',
        },
      },
      user: {
        connect: {
          id: 2,
        },
      },
      roomCount: 10,
      category: {
        connect: {
          id: 'HOTEL',
        },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
