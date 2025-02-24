
interface PlantResultsProps {
  suggestions: any[];
}

export const PlantResults = ({ suggestions }: PlantResultsProps) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-xl font-semibold text-green-800">Results</h2>
      {suggestions.map((suggestion: any, index: number) => (
        <div key={index} className="bg-white/90 rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-lg">{suggestion.plant_name}</h3>
          {suggestion.plant_details?.common_names && (
            <p className="text-gray-600 text-sm">
              Common names: {suggestion.plant_details.common_names.join(", ")}
            </p>
          )}
          {suggestion.probability && (
            <p className="text-sm text-green-600 mt-1">
              Confidence: {Math.round(suggestion.probability * 100)}%
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

