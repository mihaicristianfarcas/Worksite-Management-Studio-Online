package cache

import (
	"fmt"
	"time"
)

// Global cache instances
var (
	// QueryCache is used for database query results
	QueryCache *Cache
	
	// Default expiration times
	DefaultExpiration  = 5 * time.Minute
	ShortExpiration    = 1 * time.Minute
	LongExpiration     = 30 * time.Minute
	
	// Cleanup interval for expired items
	CleanupInterval    = 10 * time.Minute
)

// InitCache initializes the cache system
func InitCache() {
	// Initialize the query cache with default expiration and cleanup interval
	QueryCache = NewCache(DefaultExpiration, CleanupInterval)
}

// GetCacheKey generates a consistent cache key for a given entity type and ID
func GetCacheKey(entityType string, id interface{}) string {
	return entityType + ":" + stringify(id)
}

// GetCollectionCacheKey generates a consistent cache key for a collection with optional parameters
func GetCollectionCacheKey(entityType string, params ...interface{}) string {
	key := entityType + ":collection"
	
	for _, param := range params {
		key += ":" + stringify(param)
	}
	
	return key
}

// stringify converts any value to a string representation
func stringify(value interface{}) string {
	if value == nil {
		return "nil"
	}
	
	switch v := value.(type) {
	case string:
		return v
	case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64:
		return fmt.Sprintf("%d", v)
	case float32, float64:
		return fmt.Sprintf("%f", v)
	case bool:
		if v {
			return "true"
		}
		return "false"
	default:
		// Use default string representation
		return fmt.Sprintf("%v", v)
	}
}

// toString is a helper to convert values to strings
func toString(v interface{}) string {
	// Type assertion to check if value implements Stringer interface
	return toString(v)
} 