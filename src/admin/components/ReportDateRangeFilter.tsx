import { Input, Label } from '@/shared/ui';

interface ReportDateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export function ReportDateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: ReportDateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <Label htmlFor="report-date-from" className="text-xs">
          Başlangıç
        </Label>
        <Input
          id="report-date-from"
          type="date"
          className="h-8 text-xs"
          value={dateFrom}
          onChange={(event) => onDateFromChange(event.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="report-date-to" className="text-xs">
          Bitiş
        </Label>
        <Input
          id="report-date-to"
          type="date"
          className="h-8 text-xs"
          value={dateTo}
          onChange={(event) => onDateToChange(event.target.value)}
        />
      </div>
    </div>
  );
}
