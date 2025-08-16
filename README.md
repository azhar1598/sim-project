# Stone Factory Inventory & Slab Tracking System

A comprehensive web application for stone factories to streamline inventory management, improve accuracy, and optimize yield tracking using QR-based tracking system.

## 🏭 Features

### Core Functionality

- **Block Management**: Create and track stone blocks with dimensions and yield estimates
- **QR Code Generation**: Unique QR codes for blocks and slabs with printable labels
- **Slab Inspection**: Comprehensive inspection system with quality grading
- **Inventory Management**: Real-time tracking with advanced filtering and sorting
- **Analytics Dashboard**: Yield comparison and performance insights
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Key Capabilities

- ✅ Block dimension entry with automatic slab estimation
- ✅ QR code generation and printing for physical tracking
- ✅ Slab inspection with quality assessment (Excellent, Good, Fair, Defective)
- ✅ Discrepancy tracking between estimated vs actual dimensions
- ✅ Real-time inventory with filtering by status, quality, date range
- ✅ Yield analysis and trends over time
- ✅ Quality distribution analytics
- ✅ Export functionality for data backup
- ✅ Local storage persistence (no server required)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sim-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 User Workflow

### 1. Block Entry

- Navigate to "Block Entry" tab
- Enter stone block dimensions (length, width, height)
- Set slab thickness (default: 3cm)
- System automatically calculates estimated slab count
- Generate and print QR code for the block

### 2. Slab Creation & Inspection

- Navigate to "Slab Inspection" tab
- Scan QR code or manually select a block
- Create new slab for inspection
- Record actual dimensions and quality assessment
- System compares actual vs estimated and highlights discrepancies

### 3. Inventory Management

- View all blocks and slabs in organized tables
- Filter by status, quality, date range, dimensions
- Sort by various criteria (date, size, yield, quality)
- Export data for external analysis
- Bulk operations (delete multiple items)

### 4. Analytics & Reporting

- View yield performance across all blocks
- Analyze quality distribution trends
- Identify common discrepancies
- Track performance over time (weekly, monthly, quarterly, yearly)
- Get insights on best and worst performing blocks

## 🎯 System Architecture

### Frontend (Next.js + TypeScript)

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks (useState, useEffect, useMemo)

### Data Storage

- **Local Storage**: Browser localStorage for data persistence
- **No Backend Required**: Fully client-side application
- **Data Structure**: Structured JSON with TypeScript interfaces

### Key Components

```
├── components/
│   ├── Navigation.tsx      # Main navigation bar
│   ├── Dashboard.tsx       # Overview dashboard
│   ├── BlockEntry.tsx      # Block creation form
│   ├── SlabInspection.tsx  # Slab inspection interface
│   ├── Inventory.tsx       # Inventory management
│   ├── Analytics.tsx       # Analytics dashboard
│   └── QRCodeDisplay.tsx   # QR code generation & printing
├── types/
│   └── index.ts           # TypeScript interfaces
├── utils/
│   ├── storage.ts         # Data persistence utilities
│   └── calculations.ts    # Business logic calculations
```

## 📊 Data Models

### Block

```typescript
interface Block {
  id: string;
  qrCode: string;
  dimensions: { length: number; width: number; height: number };
  thickness: number;
  estimatedSlabs: number;
  actualSlabs: number;
  yield: number;
  createdAt: string;
  createdBy: string;
  status: "active" | "completed" | "archived";
  notes?: string;
}
```

### Slab

```typescript
interface Slab {
  id: string;
  blockId: string;
  qrCode: string;
  estimatedDimensions: { length: number; width: number; thickness: number };
  actualDimensions?: { length: number; width: number; thickness: number };
  quality: "excellent" | "good" | "fair" | "defective";
  defects: string[];
  inspectedAt?: string;
  inspectedBy?: string;
  status: "pending" | "inspected" | "approved" | "rejected";
  discrepancies: string[];
  notes?: string;
}
```

## 🔧 Configuration

### Yield Calculation

- **Waste Margin**: 5% (accounts for cutting waste)
- **Tolerance**: 5% for length/width, 10% for thickness
- **Quality Grades**: Excellent, Good, Fair, Defective

### QR Code Format

```json
{
  "type": "block" | "slab",
  "id": "unique-identifier",
  "timestamp": "ISO-date-string",
  "dimensions": {...},
  "thickness": number,
  "estimatedSlabs": number
}
```

## 📈 Analytics Metrics

### Yield Analysis

- **Yield Percentage**: (Actual Slabs / Estimated Slabs) × 100
- **Performance Benchmarks**:
  - Excellent: ≥90%
  - Good: 70-89%
  - Poor: <70%

### Quality Metrics

- **Quality Distribution**: Percentage breakdown by grade
- **Defect Rate**: Percentage of defective slabs
- **Common Discrepancies**: Most frequent measurement differences

## 🛠️ Customization

### Adding New Quality Grades

1. Update the `quality` type in `types/index.ts`
2. Add new grade to quality selection in `SlabInspection.tsx`
3. Update color coding in `Inventory.tsx` and `Analytics.tsx`

### Modifying Calculations

- **Yield Formula**: Edit `calculateEstimatedSlabs()` in `utils/calculations.ts`
- **Tolerance Levels**: Modify discrepancy detection in `SlabInspection.tsx`
- **Waste Margins**: Adjust `wasteMargin` constant

### Custom Reports

- Add new analytics views in `Analytics.tsx`
- Extend export functionality in `Inventory.tsx`
- Create custom filters in filter components

## 🔒 Data Security

- **Local Storage**: All data stored locally in browser
- **No External APIs**: No data transmitted to external servers
- **Privacy**: Complete data privacy and control
- **Backup**: Export functionality for data backup

## 📱 Mobile Optimization

- **Responsive Design**: Tailwind CSS breakpoints
- **Touch-Friendly**: Large buttons and touch targets
- **Mobile Navigation**: Collapsible navigation menu
- **Print Support**: QR code printing from mobile devices

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deployment Options

- **Vercel**: Automatic deployment from Git
- **Netlify**: Static site deployment
- **Self-hosted**: Deploy on any web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the component code for implementation details

## 🔄 Future Enhancements

### Planned Features

- [ ] Camera-based QR code scanning
- [ ] AI-powered dimension measurement from photos
- [ ] Multi-language support
- [ ] Advanced reporting with charts
- [ ] Integration with external systems
- [ ] Cloud storage options
- [ ] User authentication and multi-tenancy
- [ ] Barcode support
- [ ] Inventory alerts and notifications
- [ ] Mobile app (React Native)

### Technical Improvements

- [ ] Unit tests with Jest
- [ ] E2E tests with Playwright
- [ ] PWA capabilities
- [ ] Offline functionality
- [ ] Performance optimizations
- [ ] Accessibility improvements

---

**Built with ❤️ for stone factory operations**
