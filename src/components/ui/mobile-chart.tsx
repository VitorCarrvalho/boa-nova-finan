import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileChartCardProps {
  title: string;
  description?: string;
  data: any[];
  type: 'bar' | 'pie';
  height?: number;
  colors?: string[];
  className?: string;
}

const MobileChartCard: React.FC<MobileChartCardProps> = ({
  title,
  description,
  data,
  type,
  height,
  colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'],
  className = ''
}) => {
  const isMobile = useIsMobile();
  
  const chartHeight = height || (isMobile ? 200 : 300);

  const renderChart = () => {
    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? 60 : 80}
              innerRadius={isMobile ? 30 : 40}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value, name) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <XAxis 
            dataKey="name" 
            fontSize={isMobile ? 10 : 12}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? 'end' : 'middle'}
            height={isMobile ? 60 : 30}
          />
          <YAxis fontSize={isMobile ? 10 : 12} />
          <Bar 
            dataKey="value" 
            fill={colors[0]}
            radius={[2, 2, 0, 0]}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className={cn(isMobile && 'pb-3')}>
        <CardTitle className={cn(isMobile ? 'text-base' : 'text-lg')}>
          {title}
        </CardTitle>
        {description && (
          <p className={cn(
            'text-muted-foreground',
            isMobile ? 'text-xs' : 'text-sm'
          )}>
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className={cn(isMobile && 'pt-0')}>
        <ChartContainer config={{}}>
          {renderChart()}
        </ChartContainer>
        
        {/* Legend for mobile pie charts */}
        {type === 'pie' && isMobile && data.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {data.slice(0, 6).map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-xs text-muted-foreground truncate">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { MobileChartCard };