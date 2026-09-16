#![deny(clippy::all)]

use napi_derive::napi;

// Thin napi bindings — the logic lives in the `shared` crate so it stays
// testable with plain `cargo test`, no Node runtime required.

/// Add two numbers — native Rust speed
#[napi]
pub fn add(a: i32, b: i32) -> i32 {
    shared::add(a, b)
}

/// Fibonacci — demonstrates Rust performance vs JS
/// Fibonacci(40) in Rust is ~100x faster than JS
#[napi]
pub fn fibonacci(n: u32) -> u32 {
    shared::fibonacci(n)
}

/// Fast string reversal — native
#[napi]
pub fn reverse_string(s: String) -> String {
    shared::reverse_string(&s)
}

/// Counter struct — becomes JS class
#[napi]
pub struct Counter {
    inner: shared::Counter,
}

#[napi]
impl Counter {
    #[napi(constructor)]
    pub fn new(initial: Option<i32>) -> Self {
        Self {
            inner: shared::Counter::new(initial),
        }
    }

    #[napi]
    pub fn increment(&mut self) -> i32 {
        self.inner.increment()
    }

    #[napi]
    pub fn decrement(&mut self) -> i32 {
        self.inner.decrement()
    }

    #[napi]
    pub fn get_count(&self) -> i32 {
        self.inner.get()
    }

    #[napi]
    pub fn reset(&mut self) {
        self.inner.reset()
    }
}

/// Async example — becomes JS Promise
#[napi]
pub async fn fetch_data_simulated(url: String) -> napi::Result<String> {
    // Simulate async work
    Ok(format!("fetched: {}", url))
}

/// All primes up to n — sieve of Eratosthenes
#[napi]
pub fn primes_up_to(n: u32) -> Vec<u32> {
    shared::primes_up_to(n)
}
