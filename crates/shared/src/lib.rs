//! Pure Rust helpers shared by the binding crates.
//!
//! Nothing here may depend on napi — that keeps it testable with plain
//! `cargo test` and reusable from a future WASM-only crate.

/// Add two numbers.
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// Compute the nth Fibonacci number.
///
/// Fibonacci(40) here is ~100x faster than the JS fallback.
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => {
            let mut a = 0;
            let mut b = 1;
            for _ in 2..=n {
                let c = a + b;
                a = b;
                b = c;
            }
            b
        }
    }
}

/// Reverse a string by Unicode scalar.
pub fn reverse_string(s: &str) -> String {
    s.chars().rev().collect()
}

/// All primes up to and including `n` — sieve of Eratosthenes.
pub fn primes_up_to(n: u32) -> Vec<u32> {
    if n < 2 {
        return vec![];
    }
    let mut sieve = vec![true; (n + 1) as usize];
    sieve[0] = false;
    sieve[1] = false;
    let mut i = 2;
    while i * i <= n {
        if sieve[i as usize] {
            let mut j = i * i;
            while j <= n {
                sieve[j as usize] = false;
                j += i;
            }
        }
        i += 1;
    }
    sieve
        .iter()
        .enumerate()
        .filter_map(|(idx, &is_prime)| if is_prime { Some(idx as u32) } else { None })
        .collect()
}

/// Counter — plain Rust state the napi binding wraps as a JS class.
pub struct Counter {
    count: i32,
}

impl Counter {
    pub fn new(initial: Option<i32>) -> Self {
        Self {
            count: initial.unwrap_or(0),
        }
    }

    pub fn increment(&mut self) -> i32 {
        self.count += 1;
        self.count
    }

    pub fn decrement(&mut self) -> i32 {
        self.count -= 1;
        self.count
    }

    pub fn get(&self) -> i32 {
        self.count
    }

    pub fn reset(&mut self) {
        self.count = 0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds() {
        assert_eq!(add(2, 3), 5);
        assert_eq!(add(-1, 1), 0);
    }

    #[test]
    fn fibonacci_sequence() {
        assert_eq!(fibonacci(0), 0);
        assert_eq!(fibonacci(1), 1);
        assert_eq!(fibonacci(10), 55);
        assert_eq!(fibonacci(20), 6765);
    }

    #[test]
    fn reverses_by_unicode_scalar() {
        assert_eq!(reverse_string("hello"), "olleh");
        assert_eq!(reverse_string("zażółć"), "ćłóżaz");
        assert_eq!(reverse_string(""), "");
    }

    #[test]
    fn primes_edge_cases() {
        assert_eq!(primes_up_to(0), Vec::<u32>::new());
        assert_eq!(primes_up_to(1), Vec::<u32>::new());
        assert_eq!(primes_up_to(2), vec![2]);
        assert_eq!(primes_up_to(10), vec![2, 3, 5, 7]);
        assert_eq!(primes_up_to(30), vec![2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
    }

    #[test]
    fn counter_counts() {
        let mut counter = Counter::new(None);
        assert_eq!(counter.get(), 0);
        assert_eq!(counter.increment(), 1);
        assert_eq!(counter.increment(), 2);
        assert_eq!(counter.decrement(), 1);
        assert_eq!(counter.get(), 1);
        counter.reset();
        assert_eq!(counter.get(), 0);
    }

    #[test]
    fn counter_takes_an_initial_value() {
        let mut counter = Counter::new(Some(41));
        assert_eq!(counter.increment(), 42);
    }
}
