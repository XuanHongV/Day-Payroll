import React, { useState } from 'react';

import { Search, Filter, Activity, CheckCircle, Clock, XCircle, Hash, Users, DollarSign } from 'lucide-react';

import { PayrollTransaction } from '../../types';

const samplePayrollTransactions: PayrollTransaction[] = [
  {
    id: 'PAY-001',
    employeeId: 'NV001',
    amount: 1.5,
    currency: 'ETH',
    payDate: '2025-11-10T09:00:00Z',
    status: 'confirmed',
    blockchainHash: '0x1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d',
    gasUsed: 45000,
  },
  {
    id: 'PAY-002',
    employeeId: 'NV002',
    amount: 1.4,
    currency: 'ETH',
    payDate: '2025-11-10T09:01:00Z',
    status: 'confirmed',
    blockchainHash: '0x7f5e4d3c2b1a9876543210fedcba0123456789abcdef',
    gasUsed: 45000,
  },
  {
    id: 'PAY-003',
    employeeId: 'NV003',
    amount: 1.6,
    currency: 'ETH',
    payDate: '2025-11-10T09:02:00Z',
    status: 'pending',
    blockchainHash: '0x9d2c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f',
    gasUsed: 32000,
  },
  {
    id: 'PAY-004',
    employeeId: 'NV004',
    amount: 1.45,
    currency: 'ETH',
    payDate: '2025-11-10T09:03:00Z',
    status: 'failed',
    blockchainHash: '0x8b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    gasUsed: 15000,
  },
];

export const BlockchainLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [selectedTransaction, setSelectedTransaction] = useState<PayrollTransaction | null>(null);


  const filteredTransactions = samplePayrollTransactions.filter(transaction => {
    const matchesSearch = transaction.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.blockchainHash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return XCircle;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Nhật ký Giao dịch Trả lương</h2>
        <p className="text-gray-600">Bản ghi bất biến về tất cả các giao dịch trả lương trên blockchain.</p>
      </div>


      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm theo Mã NV hoặc Transaction Hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả Trạng thái</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="pending">Đang xử lý</option>
                <option value="failed">Thất bại</option>
              </select>
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Giao dịch</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Nhân viên</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Số tiền</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Trạng thái</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Thời gian</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Gas Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                const StatusIcon = getStatusIcon(transaction.status);

                return (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Hash className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.id}</p>
                          <p className="text-xs text-gray-500 font-mono">
                            {transaction.blockchainHash.slice(0, 16)}...
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                        </div>
                        <span className="text-sm font-mono text-blue-600">{transaction.employeeId}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-900">{transaction.amount} {transaction.currency}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`h-4 w-4 ${getStatusColor(transaction.status).split(' ')[0]}`} />
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(transaction.payDate).toLocaleString('vi-VN')}
                    </td>

                    <td className="py-4 px-6 text-sm text-gray-900">
                      {transaction.gasUsed.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Chi tiết Giao dịch Lương</h2>
                  <p className="text-gray-600">{selectedTransaction.id}</p>
                </div>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Thông tin Blockchain</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Transaction Hash:</span>
                    <code className="text-sm bg-white px-2 py-1 rounded border">{selectedTransaction.blockchainHash}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Block Timestamp:</span>
                    <span className="text-sm">{new Date(selectedTransaction.payDate).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Gas Used:</span>
                    <span className="text-sm">{selectedTransaction.gasUsed.toLocaleString()} gas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Trạng thái:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Chi tiết Trả lương</h3>
                  <div className="space-y-3 text-sm">
                    <div><span className="font-medium">Mã Nhân viên:</span> <span className="font-mono text-blue-600">{selectedTransaction.employeeId}</span></div>
                    <div><span className="font-medium">Số tiền:</span> {selectedTransaction.amount} {selectedTransaction.currency}</div>

                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Thông tin Mạng lưới</h3>
                  <div className="space-y-3 text-sm">
                    <div><span className="font-medium">Network:</span> Ethereum Mainnet (Ví dụ)</div>
                    <div><span className="font-medium">Confirmations:</span> {selectedTransaction.status === 'confirmed' ? '12+' : '0'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BlockchainLog;