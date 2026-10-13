import { useEffect, useMemo, useRef, useState } from "react";
import ProCardGrid from "../../components/common/ProCard/ProCardGrid.jsx";
import FeedBackList from "../../components/common/FeedBack/FeedBackList.jsx";
import Banner from "../../components/Client/Banner.jsx";
import { useCart } from "../../context/CartContext";
import "./Home.css";

const API_BASE = "http://localhost:5000";

// ==============================
// HELPERS (Giữ nguyên cấu trúc của dự án)
// ==============================
function extractProducts(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.docs)) return data.docs;
  if (Array.isArray(data.products)) return data.products;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  if (data.data && Array.isArray(data.data.products)) return data.data.products;
  if (data.products && Array.isArray(data.products.data))
    return data.products.data;
  if (data.result && Array.isArray(data.result.products))
    return data.result.products;
  return [];
}

function extractPosts(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.docs)) return data.docs;
  if (Array.isArray(data.posts)) return data.posts;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function toAbsoluteImageUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${API_BASE}${value}`;
  }

  return `${API_BASE}/${value}`;
}

function getMainImage(product) {
  if (typeof product?.thumbnail === "string" && product.thumbnail.trim()) {
    return toAbsoluteImageUrl(product.thumbnail);
  }

  if (Array.isArray(product?.images) && product.images.length > 0) {
    const first = product.images[0];

    if (typeof first === "string" && first.trim()) {
      return toAbsoluteImageUrl(first);
    }

    if (
      first &&
      typeof first === "object" &&
      typeof first.imageUrl === "string" &&
      first.imageUrl.trim()
    ) {
      return toAbsoluteImageUrl(first.imageUrl);
    }
  }

  return "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800";
}

function getPostImage(post) {
  if (typeof post?.thumbnail === "string" && post.thumbnail.trim()) {
    return toAbsoluteImageUrl(post.thumbnail);
  }

  return "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800";
}

function formatPostDate(post) {
  const raw = post?.publishedAt || post?.createdAt || "";
  if (!raw) return "---";

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "---";

  return d.toLocaleDateString("vi-VN");
}

export default function Home() {
  const { addToCart } = useCart();
  const sliderRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loadingPro, setLoadingPro] = useState(true);
  const [errorPro, setErrorPro] = useState("");

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoadingPro(true);
      setErrorPro("");

      try {
        const res = await fetch(
          `${API_BASE}/api/products?featured=true&limit=8&t=${Date.now()}`,
          {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
          },
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Không lấy được danh sách sản phẩm");
        }

        const list = extractProducts(data);

        if (!isMounted) return;
        setProducts(list);
      } catch (err) {
        console.log("Fetch featured products error:", err);
        if (!isMounted) return;
        setErrorPro(err?.message || "Lỗi không xác định");
        setProducts([]);
      } finally {
        if (isMounted) setLoadingPro(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      setErrorPosts("");

      try {
        const res = await fetch(
          `${API_BASE}/api/posts?status=published&t=${Date.now()}`,
          {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
          },
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Không lấy được bài viết");
        }

        const list = extractPosts(data);

        if (!isMounted) return;
        setPosts(list.slice(0, 3));
      } catch (err) {
        console.log("Fetch posts error:", err);
        if (!isMounted) return;
        setErrorPosts(err?.message || "Lỗi tải bài viết");
        setPosts([]);
      } finally {
        if (isMounted) setLoadingPosts(false);
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayProducts = useMemo(() => {
    return products.map((p) => ({
      ...p,
      images: [getMainImage(p)],
      price: Number(p?.price || 0),
      isNew: Boolean(p?.isNew),
      isSale: Boolean(p?.isSale),
    }));
  }, [products]);

  const scrollProducts = (direction) => {
    if (!sliderRef.current) return;

    const amount = sliderRef.current.clientWidth * 0.72;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="home home-luxury">
      {/* BANNER HEADER */}
      <Banner />

      {/* DỊCH VỤ BESPOKE & LUXURY CAM KẾT */}
      <section className="home-service">
        <div className="service-item service-box">
          <i className="fas fa-cut"></i>
          <h4>May Đo Bespoke</h4>
          <p>Thiết kế & tư vấn phom dáng theo kích thước riêng</p>
        </div>

        <div className="service-item service-box">
          <i className="fas fa-crown"></i>
          <h4>Vải Ý Cao Cấp</h4>
          <p>Nhập khẩu Wool Super 130s - 150s thượng hạng</p>
        </div>

        <div className="service-item service-box">
          <i className="fas fa-truck-fast"></i>
          <h4>Giao Hàng Tận Nơi</h4>
          <p>Đóng gói hộp Luxury bảo vệ dáng áo chuẩn VIP</p>
        </div>

        <div className="service-item service-box">
          <i className="fas fa-user-shield"></i>
          <h4>Bảo Hành Trọn Đời</h4>
          <p>Hỗ trợ chỉnh sửa phom áo miễn phí trọn đời</p>
        </div>
      </section>

      {/* DANH SÁCH SẢN PHẨM NỔI BẬT */}
      <section className="home-pro">
        <div className="heading">
          <span className="sub-title">Tuyệt Tác May Đo</span>
          <h3>Bộ Sưu Tập Vest & Suit Nổi Bật</h3>
        </div>

        <div className="product-slider-wrap">
          {!loadingPro && !errorPro && displayProducts.length > 5 && (
            <button
              className="product-slider-btn product-slider-btn-left"
              type="button"
              onClick={() => scrollProducts("left")}
              aria-label="Xem sản phẩm trước"
            >
              ‹
            </button>
          )}

          <div className="pro-card pro-card-slider" ref={sliderRef}>
            {loadingPro && (
              <div className="home-state-box home-state-info">
                Đang tải bộ sưu tập Vest...
              </div>
            )}

            {!loadingPro && errorPro && (
              <div className="home-state-box home-state-error">
                Lỗi: {errorPro}
              </div>
            )}

            {!loadingPro && !errorPro && displayProducts.length === 0 && (
              <div className="home-state-box home-state-empty">
                Chưa có sản phẩm nổi bật nào.
              </div>
            )}

            {!loadingPro &&
              !errorPro &&
              displayProducts.map((item) => (
                <div className="product-slide-item" key={item._id}>
                  <ProCardGrid product={item} onAddToCart={addToCart} />
                </div>
              ))}
          </div>

          {!loadingPro && !errorPro && displayProducts.length > 5 && (
            <button
              className="product-slider-btn product-slider-btn-right"
              type="button"
              onClick={() => scrollProducts("right")}
              aria-label="Xem sản phẩm tiếp theo"
            >
              ›
            </button>
          )}
        </div>
      </section>

      {/* BANNER PROMOTION LUXURY VEST */}
      <section className="home-banner">
        <div className="banner-left">
          <div className="banner-item banner-box banner-large-box">
            <img
              src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1200"
              alt="Bespoke Business Suit"
            />
            <div className="banner-overlay">
              <span>Italian Wool Super 150s</span>
              <h4>Vest Doanh Nhân Bespoke</h4>
              <button>Khám Phá Ngay</button>
            </div>
          </div>

          <div className="banner-item banner-box banner-large-box">
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200"
              alt="Black Tuxedo Heritage"
            />
            <div className="banner-overlay">
              <span>Satin Heritage Edition</span>
              <h4>Tuxedo Dạ Hội Sang Trọng</h4>
              <button>Khám Phá Ngay</button>
            </div>
          </div>
        </div>

        <div className="banner-right">
          <div className="banner-item banner-box banner-small-box">
            <img
              src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=800"
              alt="Cashmere Blazer"
            />
            <div className="banner-text banner-text-box">
              <p>Autumn / Winter 2026</p>
              <h4>Áo Blazer Dạ Cashmere Ý</h4>
              <button>Xem Chi Tiết</button>
            </div>
          </div>

          <div className="banner-item banner-box banner-small-box">
            <img
              src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&q=80&w=800"
              alt="Classic Double Breasted"
            />
            <div className="banner-text banner-text-box">
              <p>Classic Collection</p>
              <h4>Bộ Suit Double Breasted</h4>
              <button>Xem Chi Tiết</button>
            </div>
          </div>
        </div>
      </section>

      {/* FASHION BLOG QUÝ ÔNG */}
      <section className="home-blog">
        <div className="heading">
          <span className="sub-title">Phong Cách Quý Ông</span>
          <h3>Góc Fashion Blog & Nghệ Thuật Phối Đồ</h3>
        </div>

        <div className="blog-list">
          {loadingPosts && (
            <div className="home-state-box home-state-info">
              Đang tải bài viết...
            </div>
          )}

          {!loadingPosts && errorPosts && (
            <div className="home-state-box home-state-error">
              Lỗi: {errorPosts}
            </div>
          )}

          {!loadingPosts && !errorPosts && posts.length === 0 && (
            <div className="home-state-box home-state-empty">
              Chưa có bài viết nào.
            </div>
          )}

          {!loadingPosts &&
            !errorPosts &&
            posts.map((post) => (
              <div className="blog-item blog-card-box" key={post._id}>
                <div className="blog-img-wrap">
                  <img
                    src={getPostImage(post)}
                    alt={post.title || "blog"}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800";
                    }}
                  />
                </div>
                <div className="blog-body">
                  <span className="blog-date">{formatPostDate(post)}</span>
                  <h4>{post.title || "Bài viết"}</h4>
                  <p>{post.summary || post.description || "Chưa có mô tả."}</p>
                  <a href={`/bai-viet/${post.slug}`}>Đọc tiếp câu chuyện →</a>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* FEEDBACK DÀNH CHO KHÁCH HÀNG VIP */}
      <section className="home-feedback">
        <div className="heading">
          <span className="sub-title">Cảm Nhận Trải Nghiệm</span>
          <h3>Khách Hàng Nói Gì Về Chúng Tôi</h3>
        </div>

        <div className="feedback-box-wrap">
          <FeedBackList />
        </div>
      </section>
    </div>
  );
}