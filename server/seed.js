const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); 
const { faker } = require('@faker-js/faker/locale/vi');

// Import Models
const User = require('./models/User');
const Category = require('./models/Category');
const Coupon = require('./models/Coupon');
const Product = require('./models/Product');
const Order = require('./models/Order');
const { Color, Size } = require('./models/MasterData');

dotenv.config();

// Cấu hình mật khẩu mặc định
const DEFAULT_PASSWORD = '123456';

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- HÀM CHÍNH ---
const runSeed = async () => {
    try {
        // 1. KẾT NỐI DB
        console.log('⏳ Đang kết nối MongoDB...');
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/WebThoiTrang';
        await mongoose.connect(uri);
        console.log('✅ Đã kết nối MongoDB thành công!');

        // 2. XÓA DỮ LIỆU CŨ
        console.log('🧹 Đang dọn dẹp dữ liệu cũ...');
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            Coupon.deleteMany({}),
            Product.deleteMany({}),
            Order.deleteMany({}),
            Color.deleteMany({}),
            Size.deleteMany({})
        ]);

        // 3. MÃ HÓA MẬT KHẨU
        console.log('🔐 Đang mã hóa mật khẩu mặc định...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

        // 4. TẠO MASTER DATA
        console.log('🎨 Đang tạo Master Data...');
        const colorDocs = [
            { name: 'Đỏ', hexCode: '#FF0000' }, { name: 'Xanh Dương', hexCode: '#0000FF' },
            { name: 'Đen', hexCode: '#000000' }, { name: 'Trắng', hexCode: '#FFFFFF' },
            { name: 'Vàng', hexCode: '#FFFF00' }, { name: 'Xám', hexCode: '#808080' }
        ];
        const sizeDocs = [
            { name: 'S' }, { name: 'M' }, { name: 'L' }, { name: 'XL' }, { name: 'XXL' }
        ];
        const createdColors = await Color.insertMany(colorDocs);
        const createdSizes = await Size.insertMany(sizeDocs);

        // 5. TẠO DANH MỤC LUXURY CHO PHONG CÁCH VEST & GIÀY TÂY
        console.log('📂 Đang tạo danh mục luxury...');
        const categories = await Category.insertMany([
            { name: 'Vest Nam', slug: 'vest-nam', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80' },
            { name: 'Giày Tây Nam', slug: 'giay-tay-nam', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80' },
            { name: 'Áo Sơ Mi Luxury', slug: 'ao-so-mi-luxury', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80' },
            { name: 'Quần Âu Luxury', slug: 'quan-au-luxury', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80' },
            { name: 'Túi Xách Luxury', slug: 'tui-xach-luxury', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80' },
            { name: 'Phụ Kiện Luxury', slug: 'phu-kien-luxury', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80' }
        ]);

        // 6. TẠO MÃ KHUYẾN MÃI
        console.log('🎟️ Đang tạo mã khuyến mãi...');
        await Coupon.insertMany([
            {
                name: 'Giảm 10% cho đơn hàng mới',
                code: 'WELCOME10',
                type: 'percent',
                isFlashSale: false,
                discountValue: 10,
                minOrderValue: 500000,
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                limit: 200,
                usageCount: 0,
                banner: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
                isActive: true,
            },
            {
                name: 'Flash Sale 20%',
                code: 'FLASH20',
                type: 'percent',
                isFlashSale: true,
                discountValue: 20,
                minOrderValue: 1000000,
                startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                limit: 100,
                usageCount: 0,
                banner: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
                isActive: true,
            },
            {
                name: 'Giảm 150.000đ',
                code: 'SAVE150K',
                type: 'fixed',
                isFlashSale: false,
                discountValue: 150000,
                minOrderValue: 800000,
                startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                limit: 150,
                usageCount: 0,
                banner: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
                isActive: true,
            }
        ]);

        // 7. TẠO SẢN PHẨM LUXURY PHÙ HỢP VỚI CHỦ ĐỀ VEST & GIÀY TÂY
        console.log('👕 Đang tạo 50 sản phẩm luxury...');

        const categoryProductTemplates = {
            'vest-nam': {
                names: [
                    'Vest Nam Slim Fit Classic',
                    'Vest Nam Double Breasted',
                    'Vest Nam Premium Wool',
                    'Vest Nam Business Formal',
                    'Vest Nam Midnight Black',
                    'Vest Nam Navy Tailored',
                    'Vest Nam Luxury Charcoal',
                    'Vest Nam Slim Modern',
                    'Vest Nam Signature Office',
                    'Vest Nam Executive Grey'
                ],
                images: [
                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'
                ],
                priceMin: 2200000,
                priceMax: 6500000,
            },
            'giay-tay-nam': {
                names: [
                    'Giày Tây Oxford Black',
                    'Giày Tây Derby Brown',
                    'Giày Tây Chelsea Luxury',
                    'Giày Tây Full Grain',
                    'Giày Tây Brogue Formal',
                    'Giày Tây Classic Leather',
                    'Giày Tây Executive Brown',
                    'Giày Tây Handmade Italy',
                    'Giày Tây Patent Shine',
                    'Giày Tây Signature Leather'
                ],
                images: [
                    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80'
                ],
                priceMin: 2600000,
                priceMax: 8200000,
            },
            'ao-so-mi-luxury': {
                names: [
                    'Áo Sơ Mi Luxury Cotton',
                    'Áo Sơ Mi Italian Fit',
                    'Áo Sơ Mi White Signature',
                    'Áo Sơ Mi Premium Linen',
                    'Áo Sơ Mi Executive Blue',
                    'Áo Sơ Mi Silk Touch',
                    'Áo Sơ Mi Slim Formal',
                    'Áo Sơ Mi Luxury Stripe',
                    'Áo Sơ Mi Paris Classic',
                    'Áo Sơ Mi Business Elite'
                ],
                images: [
                    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'
                ],
                priceMin: 950000,
                priceMax: 3300000,
            },
            'quan-au-luxury': {
                names: [
                    'Quần Âu Luxury Wool',
                    'Quần Âu Tailored Black',
                    'Quần Âu Formal Grey',
                    'Quần Âu Executive Navy',
                    'Quần Âu Premium Slim',
                    'Quần Âu Signature Beige',
                    'Quần Âu Classic Charcoal',
                    'Quần Âu Italy Cut',
                    'Quần Âu Business Fit',
                    'Quần Âu Luxury Heritage'
                ],
                images: [
                    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
                ],
                priceMin: 1200000,
                priceMax: 4200000,
            },
            'tui-xach-luxury': {
                names: [
                    'Túi Xách Luxury Leather',
                    'Túi Xách Executive Black',
                    'Túi Xách Signature Brief',
                    'Túi Xách Men Leather',
                    'Túi Xách Premium Saffiano',
                    'Túi Xách Office Elite',
                    'Túi Xách Heritage Brown',
                    'Túi Xách Sartorial',
                    'Túi Xách Classic Gentleman',
                    'Túi Xách Luxury Minimal'
                ],
                images: [
                    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'
                ],
                priceMin: 1800000,
                priceMax: 5200000,
            },
            'phu-kien-luxury': {
                names: [
                    'Thắt Lưng Luxury Da',
                    'Cà Vạt Da Vinci',
                    'Đồng Hồ Nam Executive',
                    'Khăn Quàng Silk Luxury',
                    'Mắt Kính Luxury',
                    'Ví Nam Da Cao Cấp',
                    'Belt Signature Leather',
                    'Cà Vạt Formal Black',
                    'Mũ Luxury Classic',
                    'Phụ Kiện Gentleman Set'
                ],
                images: [
                    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
                    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
                ],
                priceMin: 650000,
                priceMax: 2600000,
            }
        };

        const categoryOrder = [
            'vest-nam',
            'giay-tay-nam',
            'ao-so-mi-luxury',
            'quan-au-luxury',
            'tui-xach-luxury',
            'phu-kien-luxury'
        ];

        const distribution = [10, 10, 10, 8, 7, 5];
        const products = [];

        categoryOrder.forEach((slug, index) => {
            const category = categories.find((item) => item.slug === slug);
            if (!category) return;

            const template = categoryProductTemplates[slug];
            const count = distribution[index] || 6;

            for (let i = 0; i < count; i++) {
                const productName = template.names[(i + index) % template.names.length];
                const pickedImages = [
                    template.images[(i + index) % template.images.length],
                    template.images[(i + 2 + index) % template.images.length],
                    template.images[(i + 4 + index) % template.images.length],
                ];

                const price = randomInt(template.priceMin, template.priceMax);
                const productVariants = [];
                const variantCount = randomInt(2, 4);
                for (let j = 0; j < variantCount; j++) {
                    productVariants.push({
                        color: random(createdColors)._id,
                        size: random(createdSizes)._id,
                        quantity: randomInt(8, 40),
                        priceModifier: randomInt(0, 2) * 8000
                    });
                }

                products.push({
                    name: productName,
                    slug: `${slug}-${faker.helpers.slugify(productName).toLowerCase()}-${Date.now()}-${index}-${i}`,
                    description: `Sản phẩm ${productName} mang phong cách luxury, phù hợp cho môi trường công sở, lễ hội, và sự kiện tối giản sang trọng.`,
                    price,
                    categoryId: category._id,
                    thumbnail: pickedImages[0],
                    variants: productVariants,
                    images: pickedImages.map((imageUrl) => ({ imageUrl })),
                    isActive: true,
                    isFeatured: i % 3 === 0,
                    isBestSeller: i % 4 === 0,
                    isNew: i % 2 === 0,
                    status: 'ACTIVE'
                });
            }
        });

        const createdProducts = await Product.insertMany(products);

        // 7. TẠO USER
        console.log('👤 Đang tạo tài khoản demo...');
        const users = [
            {
                username: 'admin',
                password: DEFAULT_PASSWORD,
                email: 'admin@gmail.com',
                fullName: 'Quản Trị Viên',
                phoneNumber: '0909000111',
                role: 'admin',
                address: 'Hà Nội',
                provider: 'local',
                isLocked: false,
                avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
            },
            {
                username: 'staff',
                password: DEFAULT_PASSWORD,
                email: 'staff@gmail.com',
                fullName: 'Nhân Viên Bán Hàng',
                phoneNumber: '0909000222',
                role: 'staff',
                address: 'Đà Nẵng',
                provider: 'local',
                isLocked: false,
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
            },
            {
                username: 'manager',
                password: DEFAULT_PASSWORD,
                email: 'manager@gmail.com',
                fullName: 'Quản Lý Cửa Hàng',
                phoneNumber: '0909000333',
                role: 'manager',
                address: 'TP. Hồ Chí Minh',
                provider: 'local',
                isLocked: false,
                avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
            },
            {
                username: 'customer01',
                password: DEFAULT_PASSWORD,
                email: 'customer01@gmail.com',
                fullName: 'Khách Hàng Demo 01',
                phoneNumber: '0909000444',
                role: 'customer',
                address: 'Hồ Chí Minh',
                provider: 'local',
                isLocked: false,
                avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80'
            },
            {
                username: 'customer02',
                password: DEFAULT_PASSWORD,
                email: 'customer02@gmail.com',
                fullName: 'Khách Hàng Demo 02',
                phoneNumber: '0909000555',
                role: 'customer',
                address: 'Cần Thơ',
                provider: 'local',
                isLocked: false,
                avatarUrl: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80'
            }
        ];

        for (let i = 0; i < 15; i++) {
            users.push({
                username: faker.internet.username(),
                password: DEFAULT_PASSWORD,
                email: faker.internet.email(),
                fullName: faker.person.fullName(),
                phoneNumber: faker.phone.number(),
                role: 'customer',
                address: faker.location.city(),
                provider: 'local',
                isLocked: false,
                avatarUrl: faker.image.avatarGitHub()
            });
        }
        const hashedUsers = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password || DEFAULT_PASSWORD, 10),
            }))
        );
        const createdUsers = await User.insertMany(hashedUsers);

        // 8. TẠO ORDER
        console.log('📦 Đang tạo 30 Đơn hàng...');
        const orders = [];
        const customerUsers = createdUsers.filter(u => u.role === 'Customer');

        for (let i = 0; i < 30; i++) {
            if (customerUsers.length === 0) break;

            const randomUser = random(customerUsers);
            const userAddress = randomUser.addresses[0] || { contactName: 'N/A', contactPhone: 'N/A' };
            const numItems = randomInt(1, 3);
            const orderItems = [];
            let totalAmount = 0;

            for (let k = 0; k < numItems; k++) {
                const prod = random(createdProducts);
                const variant = random(prod.variants);
                const colorInfo = createdColors.find(c => c._id.equals(variant.color));
                const sizeInfo = createdSizes.find(s => s._id.equals(variant.size));
                const qty = randomInt(1, 3);
                const unitPrice = prod.price + (variant.priceModifier || 0);

                totalAmount += unitPrice * qty;
                orderItems.push({
                    productId: prod._id,
                    variantId: variant._id,
                    colorName: colorInfo ? colorInfo.name : 'Unknown',
                    sizeName: sizeInfo ? sizeInfo.name : 'Unknown',
                    quantity: qty,
                    unitPrice: unitPrice
                });
            }

            const shippingFee = 30000;
            orders.push({
                userId: randomUser._id,
                shippingName: userAddress.contactName,
                shippingPhone: userAddress.contactPhone,
                shippingAddress: `${userAddress.addressLine}, ${userAddress.ward}, ${userAddress.district}, ${userAddress.city}`,
                totalAmount: totalAmount,
                shippingFee: shippingFee,
                finalAmount: totalAmount + shippingFee,
                paymentMethod: random(['COD', 'VNPAY', 'MOMO']),
                status: random(['Pending', 'Confirmed', 'Shipping', 'Success', 'Cancelled']),
                details: orderItems
            });
        }
        await Order.insertMany(orders);

        console.log('----------------------------------------------------');
        console.log('🎉 TẤT CẢ HOÀN TẤT!');
        console.log(`🔑 Admin: admin@gmail.com | Pass: ${DEFAULT_PASSWORD}`);
        console.log(`🔑 Staff: staff@gmail.com | Pass: ${DEFAULT_PASSWORD}`);
        console.log(`🔑 Manager: manager@gmail.com | Pass: ${DEFAULT_PASSWORD}`);
        console.log(`🎟️ Coupons: WELCOME10, FLASH20, SAVE150K`);
        console.log('----------------------------------------------------');
        process.exit();

    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

runSeed();