const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { scrapeSpecs } = require("../utils/scraper");

// --- Helper to prevent NaN Crashes ---
const parseNum = (val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const n = Number(val);
    return isNaN(n) ? 0 : n;
};

// --- Helper to parse Float ---
const parseFloatNum = (val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const n = parseFloat(val);
    return isNaN(n) ? 0.0 : n;
};

// --- Helper for Booleans ---
const parseBool = (val) => {
    if (val === undefined || val === null) return undefined;
    return val === "true" || val === "True" || val === true;
};

exports.getComponents = async (req, res) => {
    try {
        const { type, search } = req.query;
        const where = {};

        if (type && type !== "All") {
            where.type = type;
        }

        if (search) {
            where.OR = [
                { manufacturer: { contains: search, mode: "insensitive" } },
                { model_name: { contains: search, mode: "insensitive" } },
                { model_number: { contains: search, mode: "insensitive" } },
                { vendor: { contains: search, mode: "insensitive" } },
            ];
        }

        const components = await prisma.component.findMany({
            where,
            select: {
                id: true,
                type: true,
                manufacturer: true,
                vendor: true,
                model_name: true,
                model_number: true,
                product_page_url: true,
                price: true,
                discounted_price: true,
                tracked_price: true,
                updatedAt: true,
                offers: {
                    where: { in_stock: true },
                    orderBy: { price: "asc" },
                    take: 1,
                    select: { price: true, vendor: true },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        const formatted = components.map((c) => {
            const formattedUpdatedAt = c.updatedAt instanceof Date ? c.updatedAt.toISOString() : null;

            return {
                id: c.id,
                type: c.type,
                name: `${c.manufacturer} ${c.model_name}`.trim(),
                manufacturer: c.manufacturer,
                vendor: c.vendor || (c.offers[0] ? c.offers[0].vendor : "N/A"),
                model_name: c.model_name,
                model_number: c.model_number,
                product_page_url: c.product_page_url,
                price: c.price ? parseFloat(c.price) : null,
                discounted_price: c.discounted_price ? parseFloat(c.discounted_price) : null,
                tracked_price: c.tracked_price ? parseFloat(c.tracked_price) : null,
                updatedAt: formattedUpdatedAt,
            };
        });

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch components" });
    }
};

exports.getComponentById = async (req, res) => {
    try {
        const { id } = req.params;

        const base = await prisma.component.findUnique({
            where: { id },
            include: { 
                offers: true, 
                externalIds: true,
                processor: true,
                motherboard: true,
                graphics_card: true,
                power_supply: true,
                ram: true,
                cpu_cooler: true,
                ssd: true,
                hdd: true,
                cabinet: true,
                monitor: true,
                keyboard: true,
                mouse: true,
                headset: true,
                additional_case_fans: true
            },
        });

        if (!base) return res.status(404).json({ error: "Not found" });

        res.json(base);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createComponent = async (req, res) => {
    try {
        const {
            type,
            manufacturer,
            vendor,
            model_name,
            model_number,
            product_page_url,
            price,
            discounted_price,
            tracked_price,
            specs,
            tech_specs, // Front-end now sends this for specific model "data" field
        } = req.body;

        if (!type || !manufacturer || !model_name || !model_number) {
            return res.status(400).json({
                error: "Type, Manufacturer, Model Name and Model Number are required",
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Component
            const comp = await tx.component.create({
                data: {
                    type,
                    manufacturer,
                    vendor: vendor || null,
                    model_name,
                    model_number,
                    product_page_url: product_page_url || null,
                    price: price ? parseFloat(price) : null,
                    discounted_price: discounted_price ? parseFloat(discounted_price) : null,
                    tracked_price: tracked_price ? parseFloat(tracked_price) : null,
                    specs: specs || {},
                    offers: price ? {
                        create: {
                            vendor: vendor || "Manual Entry",
                            price: parseNum(price),
                            url: product_page_url || "",
                            in_stock: true,
                        },
                    } : undefined,
                },
            });

            // 2. Create Specific Model entry using the JSON "data" field
            const modelKey = type.toLowerCase();
            const validModels = [
                "processor", "motherboard", "graphics_card", "power_supply", "ram", 
                "cpu_cooler", "ssd", "hdd", "cabinet", "monitor", "keyboard", 
                "mouse", "headset", "additional_case_fans"
            ];

            if (validModels.includes(modelKey)) {
                await tx[modelKey].create({
                    data: {
                        componentId: comp.id,
                        data: tech_specs || {} // Dump everything into the Json field
                    }
                });
            }

            return comp;
        });

        res.status(201).json({ id: result.id, message: "Component created successfully" });
    } catch (error) {
        console.error("Error creating component:", error);
        res.status(500).json({ error: error.message || "Failed to create component" });
    }
};

exports.updateComponent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            type,
            manufacturer,
            vendor,
            model_name,
            model_number,
            product_page_url,
            price,
            discounted_price,
            tracked_price,
            specs,
            tech_specs
        } = req.body;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Core Component
            const updateData = {
                type,
                manufacturer,
                vendor: vendor || null,
                model_name,
                model_number,
                product_page_url: product_page_url || null,
                price: price ? parseFloat(price) : null,
                discounted_price: discounted_price ? parseFloat(discounted_price) : null,
                tracked_price: tracked_price ? parseFloat(tracked_price) : null,
                specs: specs || {},
                updatedAt: new Date()
            };

            const updatedComp = await tx.component.update({
                where: { id },
                data: updateData,
            });

            // 2. Update Specific Model "data" field
            if (tech_specs && type) {
                const modelKey = type.toLowerCase();
                const validModels = [
                    "processor", "motherboard", "graphics_card", "power_supply", "ram", 
                    "cpu_cooler", "ssd", "hdd", "cabinet", "monitor", "keyboard", 
                    "mouse", "headset", "additional_case_fans"
                ];

                if (validModels.includes(modelKey)) {
                    await tx[modelKey].update({
                        where: { componentId: id },
                        data: { data: tech_specs },
                    });
                }
            }

            return updatedComp;
        });

        if (result && result.updatedAt) {
            result.updatedAt = result.updatedAt.toISOString();
        }

        res.json({ success: true, data: result });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.addManualOffer = async (req, res) => {
    try {
        const { componentId, price, vendorName, inStock, url } = req.body;

        const offer = await prisma.offer.create({
            data: {
                componentId,
                vendor: vendorName || "Manual Entry",
                price: Number(price),
                in_stock: inStock ?? true,
                url: url || "",
            },
        });
        res.json(offer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteComponent = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.component.delete({ where: { id } });
        res.json({ success: true, message: "Component deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.fetchSpecs = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "URL required" });

        const specs = await scrapeSpecs(url);
        res.json(specs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};