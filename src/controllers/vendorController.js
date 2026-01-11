const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vendor" });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const { name, website } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Vendor name is required" });
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        website: website || null,
        isActive: true,
      },
    });

    res.status(201).json(vendor);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Vendor already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, website, isActive } = req.body;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(website !== undefined && { website }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json(vendor);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete - mark as inactive
    await prisma.vendor.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.status(500).json({ error: error.message });
  }
};
