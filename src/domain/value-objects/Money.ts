// src/domain/value-objects/Money.ts

export class Money {
  constructor(readonly amount: number, readonly currency: string = 'VND') {
    if (amount < 0) throw new Error('Số tiền không được âm')
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Không thể cộng hai loại tiền tệ khác nhau')
    return new Money(this.amount + other.amount, this.currency)
  }

  subtract(other: Money): Money {
    return new Money(this.amount - other.amount, this.currency)
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this.amount * factor), this.currency)
  }

  format(): string {
    return this.amount.toLocaleString('vi-VN') + ' ₫'
  }

  static fromNumber(n: number): Money {
    return new Money(n)
  }

  static zero(): Money {
    return new Money(0)
  }
}
