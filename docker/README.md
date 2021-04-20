
### Running krokosystem in docker:

Follow these steps to run in docker:

1) Install `docker` and `docker-compose`.
2) Clone krokapi and krokui git repos.
3) Build docker images for both applications with `docker build -t krokapi -f docker/krokapi/Dockerfile .` and `docker build -t krokui -f docker/krokui/Dockerfile .`.
4) Run `docker-compose up` within a directory with `docker-compose.yml` file (krokapi).

Software will run in developer mode.
