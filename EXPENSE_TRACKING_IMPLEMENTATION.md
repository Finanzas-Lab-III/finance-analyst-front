# Expense Tracking Implementation

## Overview

A new "Tracking de Gastos" (Expense Tracking) tab has been added to the faculty-data section. This feature allows users to track actual spending against budgeted amounts, providing real-time visibility into budget consumption.

## Architecture

### 1. API Client (`src/lib/tracking-api.ts`)

Comprehensive API client for interacting with the backend tracking endpoints:

#### **Endpoints**
- `getBudgetItems()` - Get all budget items with filters
- `getBudgetItem()` - Get specific budget item details
- `getCosts()` - Get all costs/expenses with filters
- `getCost()` - Get specific cost details
- `createCost()` - Register a new expense
- `updateCost()` - Update an existing expense
- `deleteCost()` - Remove an expense

#### **TypeScript Types**
```typescript
interface BudgetItem {
  id: number;
  cuenta: string;
  name: string | null;
  description: string | null;
  month: number;
  budgetedAmount: number;
  currency: "USD" | "ARS" | "EUR";
  areaYearId: number;
  costs?: CostSummary[];
}

interface Cost {
  id: number;
  areaYearId: number;
  budgetItemId: number | null;
  cuenta: string | null;
  month: number;
  title: string;
  description: string | null;
  amount: number;
  currency: "USD" | "ARS" | "EUR";
  createdById: number;
  budgetItem?: BudgetItemSummary;
  createdBy?: User;
}
```

#### **Helper Functions**
- `formatCurrency()` - Format amounts with proper locale and currency symbol
- `getMonthName()` - Get Spanish month names
- `calculateBudgetUsagePercentage()` - Calculate % of budget used
- `getBudgetStatusColor()` - Get color based on usage percentage
- `groupBudgetItemsByMonth()` - Group items by month

### 2. Main Component (`src/components/faculty-data/ExpenseTrackingTab.tsx`)

The main tab component that displays budget tracking information.

#### **Features**

##### **Summary Statistics**
- Total budgeted amount
- Total spent amount
- Remaining budget
- Percentage used
- Number of budget lines over budget

##### **Filtering**
- Filter by month (1-12)
- Filter by currency (ARS, USD, EUR)
- Clear filters option

##### **Budget Items List**
- Expandable/collapsible items
- Shows budgeted vs spent vs remaining
- Visual progress bars with color coding:
  - Green: < 60% used
  - Yellow: 60-80% used
  - Orange: 80-100% used
  - Red: > 100% used
- Each item shows associated costs when expanded

##### **Cost Management**
- View all costs for each budget item
- Edit existing costs
- Delete costs
- Create new costs

##### **Export**
- Export to CSV with all budget details
- Includes: Account, Name, Month, Budgeted, Spent, Remaining, % Used, Currency

### 3. Cost Modal (`src/components/faculty-data/CreateCostModal.tsx`)

Modal component for creating and editing expenses.

#### **Features**

##### **Budget Item Selection**
- Dropdown list of available budget items
- Shows: Account, Name, Month, Currency
- Option for manual entry without budget item

##### **Manual Entry Mode**
When "manual entry" is selected:
- Custom account number
- Month selection
- Currency selection

##### **Form Fields**
- **Title** (required) - Brief description of the expense
- **Description** (optional) - Additional details
- **Amount** (required) - Expense amount (must be > 0)

##### **Smart Summary**
When linked to a budget item, shows:
- Current budgeted amount
- Already spent amount
- New expense amount
- Total that will be spent
- Remaining budget after this expense
- Warning if expense will exceed budget

##### **Validation**
- Title required
- Amount must be > 0
- Account required for manual entry
- Real-time error messages

### 4. Integration (`src/app/(with_auth)/backoffice/faculty-data/[area_year_id]/page.tsx`)

The new tab has been integrated into the faculty-data page:

```typescript
const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'budget', label: 'Presupuesto' },
  { id: 'tracking', label: 'Seguimientos' },
  { id: 'expense_tracking', label: 'Tracking de Gastos' }, // NEW
  { id: 'calendar', label: 'Calendario' },
  { id: 'comments', label: 'Comentarios' },
];
```

## User Workflows

### 1. View Budget Overview
1. Navigate to faculty-data page
2. Click "Tracking de Gastos" tab
3. View summary cards showing totals
4. Review budget items list with spending status

### 2. Filter Data
1. Select a specific month from dropdown
2. Select a currency (ARS, USD, EUR)
3. View filtered results
4. Click "Limpiar filtros" to reset

### 3. Register New Expense
1. Click "Nuevo Gasto" button
2. Select a budget item OR choose manual entry
3. Enter expense title and amount
4. Add optional description
5. Review summary (if linked to budget item)
6. Click "Registrar Gasto"

### 4. Edit Existing Expense
1. Expand a budget item to see costs
2. Click edit icon on a cost
3. Modify fields
4. Click "Actualizar Gasto"

### 5. Delete Expense
1. Expand a budget item to see costs
2. Click trash icon on a cost
3. Confirm deletion

### 6. Export Data
1. Apply any desired filters
2. Click "Exportar" button
3. CSV file downloads with current view data

## Visual Design

### Color Coding
- **Green** (< 60% used): Healthy budget status
- **Yellow** (60-80% used): Caution, approaching limit
- **Orange** (80-100% used): Warning, near limit
- **Red** (> 100% used): Alert, budget exceeded

### Icons
- 💵 **DollarSign** - Budgeted amount
- 📈 **TrendingUp** - Spent amount
- 📉 **TrendingDown** - Remaining amount
- ⚠️ **AlertCircle** - Percentage used / warnings
- ➕ **Plus** - Create new expense
- ✏️ **Edit** - Edit expense
- 🗑️ **Trash** - Delete expense
- 📥 **Download** - Export data
- ❯ **ChevronRight/Down** - Expand/collapse

### Layout
- **Header**: Title, description, action buttons
- **Filters**: Month and currency dropdowns
- **Summary Cards**: 4-column grid with key metrics
- **Budget Items**: Expandable list with progress bars
- **Costs**: Nested list within each budget item

## API Integration

### Base URL
```typescript
baseURL: process.env.NEXT_PUBLIC_SERVICE_URL
```

### Authentication
Uses `withCredentials: true` to send cookies with requests.

### Error Handling
- Try-catch blocks on all API calls
- User-friendly error messages
- Console logging for debugging

### Data Refresh
- Automatic reload after creating/updating/deleting costs
- Manual refresh via filter changes

## Backend API Expectations

The frontend expects the following API endpoints:

### GET `/api/tracking/budget-items/`
Query parameters:
- `area_year_id` (required)
- `cuenta` (optional)
- `month` (optional)
- `currency` (optional)
- `page_size` (optional)

Response:
```json
{
  "budget_items": [
    {
      "id": 1,
      "areaYearId": 1,
      "cuenta": "1234567",
      "cuentaId": "1234567",
      "name": "Personnel",
      "description": "Salary expenses",
      "month": 3,
      "budgetedAmount": 50000,
      "currency": "ARS",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 100
}
```

**Note:** The API client automatically transforms this to the standard paginated format used internally by the frontend.

### GET `/api/tracking/budget-items/{id}/`
Returns single budget item with same structure.

### GET `/api/tracking/costs/`
Query parameters:
- `area_year_id` (optional)
- `budget_item_id` (optional)
- `cuenta` (optional)
- `month` (optional)
- `currency` (optional)
- `created_by_id` (optional)

Response:
```json
{
  "costs": [
    {
      "id": 1,
      "areaYearId": 1,
      "budgetItemId": 1,
      "cuenta": "1234567",
      "month": 3,
      "title": "Office supplies",
      "description": "Monthly office supplies purchase",
      "amount": 5000,
      "currency": "ARS",
      "createdById": 1,
      "createdAt": "2025-01-30T10:00:00Z",
      "updatedAt": "2025-01-30T10:00:00Z"
    }
  ],
  "total": 50
}
```

**Note:** The API client automatically transforms this to the standard paginated format used internally by the frontend.

### POST `/api/tracking/costs/`
Request body:
```json
{
  "area_year_id": 1,
  "budget_item_id": 1,
  "cuenta": "1234567",
  "month": 3,
  "title": "Office supplies",
  "description": "Monthly office supplies purchase",
  "amount": 5000,
  "currency": "ARS",
  "created_by_id": 1
}
```

### PUT `/api/tracking/costs/{id}/`
Request body: Partial update with any of the fields from POST.

### DELETE `/api/tracking/costs/{id}/`
No request body. Returns 204 on success.

## Security & Permissions

- Uses authenticated user from `AuthContext`
- User ID automatically attached to created costs
- Edit/Delete buttons shown based on permissions
- Backend should validate user permissions

## Performance Considerations

- Pagination support (page_size parameter)
- Filtered queries to reduce data transfer
- Client-side calculations for statistics
- Memoization for expensive calculations
- Expandable items to reduce initial render

## Future Enhancements

1. **Attachments** - Upload receipts/invoices for costs
2. **Approval Workflow** - Multi-stage approval process
3. **Bulk Import** - Import costs from Excel/CSV
4. **Notifications** - Alert when budget thresholds reached
5. **Charts** - Visual representations of spending over time
6. **Categories** - Group costs by category
7. **Forecasting** - Project future spending based on trends
8. **Audit Log** - Track all changes to costs
9. **Comments** - Add notes/comments to costs
10. **Multi-currency Conversion** - Automatic exchange rates

## Testing Checklist

- [ ] Tab appears in faculty-data page
- [ ] Budget items load correctly
- [ ] Costs load correctly
- [ ] Filters work (month, currency)
- [ ] Summary statistics calculate correctly
- [ ] Create new cost (with budget item)
- [ ] Create new cost (manual entry)
- [ ] Edit existing cost
- [ ] Delete cost
- [ ] Export to CSV
- [ ] Expand/collapse budget items
- [ ] Progress bars display correctly
- [ ] Color coding works (green/yellow/orange/red)
- [ ] Over-budget warnings appear
- [ ] Form validation works
- [ ] Error messages display
- [ ] Mobile responsive layout

## Troubleshooting

### Issue: Budget items not loading
- Check `area_year_id` parameter
- Verify API endpoint is correct
- Check browser console for errors
- Verify authentication cookies

### Issue: Costs not appearing
- Ensure costs are linked to budget items via `budget_item_id`
- Check API response format matches expected structure
- Verify `area_year_id` matches

### Issue: Cannot create cost
- Verify user is authenticated
- Check required fields (title, amount)
- Ensure amount > 0
- Check backend validation rules

### Issue: Colors not showing
- Verify Tailwind CSS is properly configured
- Check class names are not being purged
- Inspect browser DevTools for CSS issues

## Files Created/Modified

### Created:
1. `src/lib/tracking-api.ts` - API client and types
2. `src/components/faculty-data/ExpenseTrackingTab.tsx` - Main tab component
3. `src/components/faculty-data/CreateCostModal.tsx` - Cost creation/editing modal
4. `EXPENSE_TRACKING_IMPLEMENTATION.md` - This documentation

### Modified:
1. `src/app/(with_auth)/backoffice/faculty-data/[area_year_id]/page.tsx` - Added new tab

## Dependencies

No new dependencies required. Uses existing:
- React
- Next.js
- Axios
- Lucide React (icons)
- Tailwind CSS

---

**Implementation Date**: October 30, 2025  
**Status**: ✅ Complete  
**Version**: 1.0.0

