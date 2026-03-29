import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Product } from '../types';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, userProfile } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const canManageProducts = userProfile?.permissions?.canManageProducts ?? (userProfile?.role === 'Admin' || userProfile?.role === 'Ads Manager');

  const [formData, setFormData] = useState({
    name: '',
    buyingPrice: '',
    sellingPrice: '',
    websiteLink: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      buyingPrice: Number(formData.buyingPrice),
      sellingPrice: Number(formData.sellingPrice),
      websiteLink: formData.websiteLink,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', buyingPrice: '', sellingPrice: '', websiteLink: '' });
    } catch (error) {
      // Error handled by handleFirestoreError
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      buyingPrice: product.buyingPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      websiteLink: product.websiteLink || '',
    });
    setIsModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete);
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      } catch (error) {
        // Error handled by handleFirestoreError
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        {canManageProducts && (
          <Button onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', buyingPrice: '', sellingPrice: '', websiteLink: '' });
            setIsModalOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buying Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/products/${product.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                    {product.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">${product.buyingPrice.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">${product.sellingPrice.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                  ${(product.sellingPrice - product.buyingPrice).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.websiteLink ? (
                    <a href={product.websiteLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Link
                    </a>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {canManageProducts && (
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => openEditModal(product)} className="text-gray-400 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => confirmDelete(product.id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No products found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Wireless Earbuds"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buying Price ($)</label>
              <Input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.buyingPrice}
                onChange={(e) => setFormData({ ...formData, buyingPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price ($)</label>
              <Input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Website Link</label>
            <Input
              type="url"
              value={formData.websiteLink}
              onChange={(e) => setFormData({ ...formData, websiteLink: e.target.value })}
              placeholder="https://example.com/product"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this product? All associated data will be removed. This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
