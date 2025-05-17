function getRandomCodeBlock() {
  const codeBlocks = [
    {
      language: "Python",
      code: `
def fibonacci(n):
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

def is_prime(num):
    if num <= 1:
        return False
    for i in range(2, int(num**0.5) + 1):
        if num % i == 0:
            return False
    return True

print("First 10 Fibonacci numbers:", fibonacci(10))
print("Is 29 a prime number?", is_prime(29))
      `.trim(),
    },
    {
      language: "JavaScript",
      code: `
function isPalindrome(str) {
    const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean === clean.split('').reverse().join('');
}

function countVowels(str) {
    return (str.match(/[aeiou]/gi) || []).length;
}

const testString = "Was it a car or a cat I saw?";
console.log("Is palindrome:", isPalindrome(testString));
console.log("Vowel count:", countVowels(testString));
      `.trim(),
    },
    {
      language: "C++",
      code: `
#include <iostream>
#include <vector>

bool isPrime(int n) {
    if (n <= 1) return false;
    for (int i = 2; i*i <= n; ++i)
        if (n % i == 0) return false;
    return true;
}

int main() {
    std::vector<int> primes;
    for (int i = 2; i < 50; ++i)
        if (isPrime(i)) primes.push_back(i);

    std::cout << "Primes under 50:\\n";
    for (int p : primes)
        std::cout << p << " ";
    std::cout << std::endl;
    return 0;
}
      `.trim(),
    },
    {
      language: "Go",
      code: `
package main

import (
    "fmt"
    "strings"
)

func reverse(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}

func main() {
    text := "GoLang is powerful!"
    fmt.Println("Original:", text)
    fmt.Println("Uppercase:", strings.ToUpper(text))
    fmt.Println("Reversed:", reverse(text))
}
      `.trim(),
    },
    {
      language: "Java",
      code: `
import java.util.Arrays;

public class ArrayDemo {
    public static void main(String[] args) {
        int[] numbers = {12, 5, 8, 19, 34, 2};
        Arrays.sort(numbers);

        System.out.println("Sorted array:");
        for (int num : numbers) {
            System.out.print(num + " ");
        }

        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }

        System.out.println("\\nSum of elements: " + sum);
    }
}
      `.trim(),
    },
    {
      language: "Rust",
      code: `
fn factorial(n: u64) -> u64 {
    (1..=n).product()
}

fn is_even(n: u32) -> bool {
    n % 2 == 0
}

fn main() {
    println!("Factorial of 6 is: {}", factorial(6));

    for i in 1..=10 {
        println!("{} is even: {}", i, is_even(i));
    }
}
      `.trim(),
    },
    {
      language: "Ruby",
      code: `
def greet_user(name)
  puts "Hello, \#{name.capitalize}! Welcome back!"
end

def sum_array(arr)
  arr.reduce(0) { |sum, n| sum + n }
end

greet_user("owais")
puts "Sum of [1, 2, 3, 4, 5]: \#{sum_array([1,2,3,4,5])}"
      `.trim(),
    },
    {
      language: "TypeScript",
      code: `
function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

function doubleArray(nums: number[]): number[] {
    return nums.map(n => n * 2);
}

const user = "Alice";
const numbers = [1, 2, 3, 4];

console.log(greet(user));
console.log("Doubled numbers:", doubleArray(numbers));
      `.trim(),
    },
    {
      language: "Kotlin",
      code: `
fun isLeapYear(year: Int): Boolean {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)
}

fun main() {
    val years = listOf(2020, 2021, 1900, 2000)
    for (year in years) {
        println("\$year is leap year: \${isLeapYear(year)}")
    }
}
      `.trim(),
    },
  ];

  return codeBlocks[Math.floor(Math.random() * codeBlocks.length)];
}


module.exports = getRandomCodeBlock;