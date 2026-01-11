const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { scrapeSpecs } = require("../utils/scraper");

// --- Helpers to prevent NaN and Type Errors ---
const parseNum = (val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const n = Number(val);
    return isNaN(n) ? 0 : n;
};

const parseFloatNum = (val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const n = parseFloat(val);
    return isNaN(n) ? 0.0 : n;
};

// Helper to map Frontend "TYPE" to exact Prisma Model Names (For DB Actions)
const getPrismaModelName = (type) => {
    const map = {
        'PROCESSOR': 'processor',
        'MOTHERBOARD': 'motherboard',
        'GRAPHICS_CARD': 'graphicsCard',
        'POWER_SUPPLY': 'powerSupply',
        'RAM': 'ram',
        'CPU_COOLER': 'cpuCooler',
        'SSD': 'ssd',
        'HDD': 'hdd',
        'CABINET': 'cabinet',
        'MONITOR': 'monitor',
        'KEYBOARD': 'keyboard',
        'MOUSE': 'mouse',
        'HEADSET': 'headset',
        'ADDITIONAL_CASE_FANS': 'additionalCaseFans'
    };
    return map[type.toUpperCase()];
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

        const formatted = components.map((c) => ({
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
            updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : null,
        }));

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

        // Clean null relations based on component type
        const currentRelationKey = base.type.toLowerCase();
        const relationKeys = [
            "processor", "motherboard", "graphics_card", "power_supply", 
            "ram", "cpu_cooler", "ssd", "hdd", "cabinet", 
            "monitor", "keyboard", "mouse", "headset", "additional_case_fans"
        ];

        relationKeys.forEach(key => {
            if (key !== currentRelationKey && base[key] === null) {
                delete base[key];
            }
        });

        res.json(base);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createComponent = async (req, res) => {
    try {
        const {
            type, manufacturer, vendor, model_name, model_number,
            product_page_url, price, discounted_price, tracked_price,
            specs, tech_specs, core_custom_data
        } = req.body;

        if (!type || !manufacturer || !model_name || !model_number) {
            return res.status(400).json({
                error: "Type, Manufacturer, Model Name and Model Number are required",
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Base Component
            const comp = await tx.component.create({
                data: {
                    type,
                    manufacturer,
                    vendor: vendor || null,
                    model_name,
                    model_number,
                    product_page_url: product_page_url || null,
                    price: price ? parseFloatNum(price) : null,
                    discounted_price: discounted_price ? parseFloatNum(discounted_price) : null,
                    tracked_price: tracked_price ? parseFloatNum(tracked_price) : null,
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

            // 2. Create Specific Model entry using getPrismaModelName
            const modelKey = getPrismaModelName(type);

            if (modelKey && tx[modelKey]) {
                await tx[modelKey].create({
                    data: {
                        componentId: comp.id,
                        core_custom_data: core_custom_data || {},
                        data: tech_specs || {}
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
            type, manufacturer, vendor, model_name, model_number,
            product_page_url, price, discounted_price, tracked_price,
            specs, tech_specs, core_custom_data
        } = req.body;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Core Component
            const updatedComp = await tx.component.update({
                where: { id },
                data: {
                    type,
                    manufacturer,
                    vendor: vendor || null,
                    model_name,
                    model_number,
                    product_page_url: product_page_url || null,
                    price: price ? parseFloatNum(price) : null,
                    discounted_price: discounted_price ? parseFloatNum(discounted_price) : null,
                    tracked_price: tracked_price ? parseFloatNum(tracked_price) : null,
                    specs: specs || {},
                    updatedAt: new Date()
                },
            });

            // 2. Update Specific Model using getPrismaModelName
            const modelKey = getPrismaModelName(type);

            if (modelKey && tx[modelKey]) {
                const modelDataUpdate = {};
                if (tech_specs !== undefined) modelDataUpdate.data = tech_specs;
                if (core_custom_data !== undefined) modelDataUpdate.core_custom_data = core_custom_data;

                await tx[modelKey].update({
                    where: { componentId: id },
                    data: modelDataUpdate,
                });
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