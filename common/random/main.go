package random

import (
	"github.com/google/uuid"
	"math/rand"
	"strings"
	"time"
)

func GetUUID() string {
	code := uuid.New().String()
	code = strings.Replace(code, "-", "", -1)
	return code
}

const keyChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const keyNumbers = "0123456789"

var r = rand.New(rand.NewSource(time.Now().UnixNano()))

func GenerateKey() string {
	key := make([]byte, 48)
	for i := 0; i < 16; i++ {
		key[i] = keyChars[r.Intn(len(keyChars))]
	}
	uuid_ := GetUUID()
	for i := 0; i < 32; i++ {
		c := uuid_[i]
		if i%2 == 0 && c >= 'a' && c <= 'z' {
			c = c - 'a' + 'A'
		}
		key[i+16] = c
	}
	return string(key)
}

func GetRandomString(length int) string {
	key := make([]byte, length)
	for i := 0; i < length; i++ {
		key[i] = keyChars[r.Intn(len(keyChars))]
	}
	return string(key)
}

func GetRandomNumberString(length int) string {
	key := make([]byte, length)
	for i := 0; i < length; i++ {
		key[i] = keyNumbers[r.Intn(len(keyNumbers))]
	}
	return string(key)
}

// RandRange returns a random number between min and max (max is not included)
func RandRange(min, max int) int {
	return min + r.Intn(max-min)
}
