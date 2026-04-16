export default function FilterSkeleton() {
  return (
    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-17 gap-y-5 text-center px-14 animate-pulse">

      {/* Image Skeleton */}
      <div className="flex flex-col border border-transparent items-center gap-2 p-4 rounded-md">
            <div className="w-14 h-14 rounded-md bg-gray-200" />
            <div className="w-16 h-3 rounded bg-gray-200" />
      </div>
     

    </div>
  );
}