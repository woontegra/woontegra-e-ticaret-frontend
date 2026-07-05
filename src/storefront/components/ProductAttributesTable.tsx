import type { PublicProductAttributeRowDto } from '@/shared/types/api';
import { uiLabel } from '@/shared/lib/storefront-ui';
import { useStorefrontUi } from '@/storefront/hooks/useStorefrontUi';

interface ProductAttributesTableProps {
  attributes: PublicProductAttributeRowDto[];
}

export function ProductAttributesTable({
  attributes,
}: ProductAttributesTableProps) {
  const ui = useStorefrontUi();
  const productAttributesTitle = uiLabel(ui, 'productAttributesTitle');

  if (attributes.length === 0 || !productAttributesTitle) return null;

  return (
    <div className="mt-10">
      <h2 className="theme-heading text-lg font-semibold">{productAttributesTitle}</h2>
      <table className="mt-3 w-full text-sm">
        <tbody>
          {attributes.map((row) => (
            <tr key={row.code} className="border-b border-slate-100">
              <th className="py-2 pr-4 text-left font-medium text-slate-600">
                {row.name}
              </th>
              <td className="py-2 text-slate-800">
                <span className="inline-flex items-center gap-2">
                  {row.colorHex ? (
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-slate-200"
                      style={{ backgroundColor: row.colorHex }}
                      aria-hidden
                    />
                  ) : null}
                  {row.value}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
