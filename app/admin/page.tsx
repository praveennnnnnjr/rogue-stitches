'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10'); // Default Stock
  const [category, setCategory] = useState('Oversized Tees');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  // Quick Edit Modal State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [updatingStock, setUpdatingStock] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  // Image select pannumbodhu preview kaatta
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !imageFile) {
      alert('Please fill Title, Price, and Select an Image File!');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Image-a Supabase Storage-ku Upload Pannuvadhu
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        throw new Error('Image upload failed: ' + uploadError.message);
      }

      // 2. Upload aana Image-odaya Public URL Get Pannuvadhu
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      // 3. Slug Generate Pannuvadhu
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // 4. Product Database-la Insert Pannuvadhu (including Stock)
      const { error: dbError } = await supabase.from('products').insert([
        {
          title,
          price: parseFloat(price),
          stock: parseInt(stock) || 0,
          category,
          image_url: imageUrl,
          description,
          slug,
        },
      ]);

      if (dbError) {
        throw new Error('Database insert failed: ' + dbError.message);
      }

      alert('Product added successfully!');

      // Form Reset
      setTitle('');
      setPrice('');
      setStock('10');
      setImageFile(null);
      setImagePreview(null);
      setDescription('');
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      alert('Error deleting product: ' + error.message);
    } else {
      fetchProducts();
    }
  };

  // Stock Update Quick Function (Edit & Sold Out)
  const handleUpdateStock = async (newStockValue: number) => {
    if (!editingProduct) return;
    setUpdatingStock(true);

    const { error } = await supabase
      .from('products')
      .update({ stock: newStockValue })
      .eq('id', editingProduct.id);

    if (error) {
      alert('Failed to update stock: ' + error.message);
    } else {
      setEditingProduct(null);
      fetchProducts();
    }
    setUpdatingStock(false);
  };

  return (
    <div className="min-h-screen bg-void text-bone p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-8 border-b border-seam pb-4">
          Admin - Product Management
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Form: Add New Product */}
          <div className="bg-panel border border-seam p-6 rounded-lg h-fit">
            <h2 className="text-lg font-bold uppercase mb-4 text-bone">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
              <div>
                <label className="text-xs uppercase text-smoke block mb-1 font-bold">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Oversized Baggy Tee"
                  className="w-full bg-void border border-seam rounded p-2 text-sm text-bone focus:border-bone outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase text-smoke block mb-1 font-bold">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1299"
                    className="w-full bg-void border border-seam rounded p-2 text-sm text-bone focus:border-bone outline-none"
                    required
                  />
                </div>

                {/* Stock Count Field */}
                <div>
                  <label className="text-xs uppercase text-smoke block mb-1 font-bold">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="10"
                    className="w-full bg-void border border-seam rounded p-2 text-sm text-bone focus:border-bone outline-none"
                    required
                  />
                </div>
              </div>

              {/* Updated Category Options */}
              <div>
                <label className="text-xs uppercase text-smoke block mb-1 font-bold">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-void border border-seam rounded p-2 text-sm text-bone focus:border-bone outline-none"
                >
                  <option value="Oversized Tees">Oversized Tees</option>
                  <option value="Shirts">Shirts</option>
                  <option value="Track Pant">Track Pant</option>
                  <option value="Pants">Pants</option>
                </select>
              </div>

              {/* Direct Photo Upload Input */}
              <div>
                <label className="text-xs uppercase text-smoke block mb-1 font-bold">
                  Product Photo Upload *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full bg-void border border-seam rounded p-2 text-sm text-bone file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-bone file:text-void hover:file:bg-smoke cursor-pointer"
                  required
                />
                {imagePreview && (
                  <div className="mt-3 relative w-full h-32 rounded border border-seam overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs uppercase text-smoke block mb-1 font-bold">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="100% Heavyweight Cotton..."
                  rows={3}
                  className="w-full bg-void border border-seam rounded p-2 text-sm text-bone focus:border-bone outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-bone text-void font-bold py-3 rounded text-xs uppercase tracking-widest hover:bg-smoke transition mt-2 disabled:opacity-50"
              >
                {submitting ? 'Uploading & Saving...' : 'Add Product'}
              </button>
            </form>
          </div>

          {/* List: Existing Products */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold uppercase mb-4 text-bone">
              Product List ({products.length})
            </h2>

            {loading ? (
              <p className="text-smoke text-sm">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="text-smoke text-sm">No products added yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-panel border border-seam p-4 rounded-lg flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-void rounded overflow-hidden flex-shrink-0 border border-seam">
                        {p.image_url ? (
                          <Image
                            src={p.image_url}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-smoke">
                            No Img
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-sm uppercase tracking-wide">{p.title}</h3>
                        <p className="text-xs text-smoke">
                          ₹{p.price} | {p.category}
                        </p>
                        
                        {/* Dynamic Stock Display Badge */}
                        <p className="text-xs mt-1">
                          {(p.stock ?? 0) > 0 ? (
                            <span className="text-green-400 font-mono">Stock: {p.stock}</span>
                          ) : (
                            <span className="text-red-400 font-bold uppercase tracking-wider">Sold Out</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Edit Stock Button */}
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setEditStock(p.stock ?? 0);
                        }}
                        className="bg-bone/10 border border-bone/30 text-bone hover:bg-bone hover:text-void text-xs font-bold px-3 py-2 rounded transition"
                      >
                        Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold px-3 py-2 rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK EDIT STOCK MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-panel border border-seam rounded-lg p-6 w-full max-w-sm relative shadow-2xl">
            <h3 className="text-sm font-bold uppercase text-bone mb-1">
              Edit Stock: {editingProduct.title}
            </h3>
            <p className="text-xs text-smoke mb-4">Stock quantity-a maathunga illana Sold Out-a mark pannunga.</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs uppercase text-smoke block mb-1 font-bold">
                  Stock Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={editStock}
                  onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                  className="w-full bg-void border border-seam rounded p-2 text-sm text-bone outline-none focus:border-bone"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStock(editStock)}
                  disabled={updatingStock}
                  className="flex-1 bg-bone text-void text-xs font-bold py-2.5 rounded uppercase hover:bg-smoke transition disabled:opacity-50"
                >
                  Save Stock
                </button>

                <button
                  onClick={() => handleUpdateStock(0)}
                  disabled={updatingStock}
                  className="flex-1 bg-red-600/80 text-white text-xs font-bold py-2.5 rounded uppercase hover:bg-red-600 transition disabled:opacity-50"
                >
                  Mark Sold Out
                </button>
              </div>

              <button
                onClick={() => setEditingProduct(null)}
                className="text-xs text-smoke hover:text-bone text-center mt-1 uppercase underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}