# Base Docker image
FROM node:16

# The application port.
EXPOSE 1337

ENV NODE_ENV="production"

# Add the application source to the image.
ADD ./app /app



# Set the working directory to the application directory.
WORKDIR /app

# Security: Add user

RUN groupadd -g 1002 -r globalinput101 && useradd -r -u 1002 -g globalinput101 globalinput101 && chown -R globalinput101:globalinput101 /app && mkdir /home/globalinput101 &&   chown -R globalinput101:globalinput101 /home/globalinput101

USER globalinput101



# Set the command that will be executed when the image is
# run. In this case it will be the application.
ENTRYPOINT ["node", "/app/server.js"]

# Set the default `--config` parameter to be passed to the
# entry point.
#
# This assumes that a configuration file has been mounted.
CMD ["--config", "/app/config/config.json"]
