'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useCart } from '@/services/cart/CartContext';
import { usePathname, useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import FilterDrawer from '@/components/modals/FilterDrawer';

interface Product {
  id: string;
  productName: string;
  description: string;
  price: string;
  category: string;
  stockQuantity: number;
  weight: string;
  productStatus: string;
  images: string[];
  userId: string;
  versionId: string;
}

interface Category {
  enabled: true;
  id: string;
  name: string;
}

const Marketplace: React.FC = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    minPrice: '',
    maxPrice: '',
    sortOrder: '',
    category: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUserRole = async () => {
      const session = await getSession();
      setUserRole(session?.user?.role ?? null);
    };
  
    fetchUserRole();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: productsPerPage.toString(),
      });

      if (filters.name) params.set('name', filters.name);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.category) params.set('category', filters.category);
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/marketplace?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.categories.filter((cat: Category) => cat.enabled));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      minPrice: '',
      maxPrice: '',
      sortOrder: '',
      category: '',
    });
    setCurrentPage(1);
    fetchProducts();
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center">
      <section
        className="w-full bg-base-100 py-12 relative flex items-center justify-center"
        style={{
          backgroundImage: `url(/images/market/merc.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '400px',
          width: '100%',
        }}
      >
        <div className="text-center p-6 bg-base-100 bg-opacity-70 rounded-lg shadow-lg max-w-lg mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-base-content">Mercado Regional</h1>
          <p className="text-xl mb-6 text-base-content">
            O melhor do mercado tradicional no conforto de sua casa
          </p>
        </div>
        <label
          htmlFor="my-drawer"
          className="btn btn-primary absolute bottom-0 right-0 m-4 drawer-button"
        >
          Filtrar
        </label>
      </section>

      {/* Uso do componente FilterDrawer */}
      <FilterDrawer
        filters={filters}
        categories={categories}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <section className="py-12 flex flex-wrap justify-center gap-6">
        {products.map((product) => (
          <div key={product.id} className="card w-72 bg-base-100 shadow-xl relative">
            <button
              onClick={() => router.push(`${pathname}/${product.id}`)}
              className="cursor-pointer p-0 w-full text-left border-none bg-transparent"
            >
              <figure>
                <Image
                  src={(Array.isArray(product.images) && product.images[0]) || 'https://via.placeholder.com/400x300'}
                  alt={product.productName}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-xl mb-2">
                  {product.productName}
                </h3>
                <p className="text-xl text-green-700 dark:text-green-400 mb-2">
                  €{product.price}
                </p>
              </div>
            </button>
            {userRole !== 'seller' && userRole !== 'admin' && (
              <button
                className="absolute bottom-4 right-4 w-10 h-10 p-0 border-none bg-transparent transition-transform transform hover:scale-110 active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({
                    id: product.id,
                    productName: product.productName,
                    price: parseFloat(product.price),
                    image: product.images[0],
                    quantity: 1,
                    userId: product.userId,
                    versionId: product.versionId
                  });
                }}
              >
                <Image
                  src="/icons/add-cart.png"
                  alt="Adicionar ao carrinho"
                  width={40}
                  height={40}
                  className="w-full h-full"
                />
              </button>
            )}
          </div>
        ))}
      </section>

      <div className="btn-group">
        <button
          className="btn"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
            onClick={() => paginate(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="btn"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Seguinte
        </button>
      </div>
    </div>
  );
};

export default Marketplace;
