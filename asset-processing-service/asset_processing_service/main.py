import time


def main():
    count = 0
    while True:
        print("Hello World")
        time.sleep(1)
        count += 1
        if count == 5:
            break


if __name__ == "__main__":
    main()
