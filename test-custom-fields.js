const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  try {
    const recent = await prisma.component.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { id: true, manufacturer: true, model_name: true, specs: true },
    });
    console.log(
      "Recent component specs:",
      JSON.stringify(recent?.specs, null, 2)
    );

    // Check for custom fields in the most recent component
    if (recent?.specs) {
      const customFields = Object.keys(recent.specs).filter(
        (key) =>
          !["extra_specs"].includes(key) &&
          typeof recent.specs[key] !== "object"
      );
      console.log("Custom field keys:", customFields);
    }
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
