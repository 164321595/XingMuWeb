import { Performance } from '@/types';
import Loading from '../common/Loading';
import { Empty } from '../Empty';
import PerformanceCard from './PerformanceCard';

interface PerformanceListProps {
  performances: Performance[];
  loading: boolean;
}

export default function PerformanceList({ performances, loading }: PerformanceListProps) {
  if (loading) {
    return (
      <div className="py-16">
        <Loading size="medium" text="加载演出列表中..." />
      </div>
    );
  }
  
  if (!performances || performances.length === 0) {
    return <Empty />;
  }
  
  return (
    <div>
      {/* 演出列表 - 一次性展示所有演出 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {performances.map(performance => (
          <PerformanceCard key={performance.id} performance={performance} />
        ))}
      </div>
    </div>
  );
}