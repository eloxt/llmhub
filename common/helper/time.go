package helper

import (
	"fmt"
	"time"
)

func GetTimeString() string {
	now := time.Now()
	return fmt.Sprintf("%s%d", now.Format("20060102150405"), now.UnixNano()%1e9)
}

// CalcElapsedTime return the elapsed time in milliseconds (ms)
func CalcElapsedTime(start time.Time) int64 {
	return time.Now().Sub(start).Milliseconds()
}
